# Modularized information.coffee
define((require) ->
    # Coffee for information.html
    $ = require('jquery')
    datepicker = require('bootstrap-datepicker')
    timepicker = require('bootstrap-timepicker')
    ZeroClipboard = require('ZeroClipboard')
    informationForm = null
    postURL = '/admin/organization/election/information'

    # Class for an information form
    InformationForm = ->
        # Closure reference
        self = this

        # String: the Datastore id of the election
        @id = ""

        # Input: Election Name
        @name = $('#name')

        # Start Date Picker
        @startDate = $('#startDate').datepicker()
            # # Can't pick a start date in the past
            # onRender: (date) ->
            #     if date.valueOf() >= now.valueOf() then '' else 'disabled'
        .on 'changeDate', (ev) =>
            if ev.date.valueOf() > @endDate.date.valueOf()
                newDate = new Date(ev.date)
                @endDate.setValue(newDate)
            @startDate.hide()
            @resetSubmitBtn
            @endDate.show()
        .data('datepicker')

        # End Date Picker
        @endDate = $('#endDate').datepicker()
            # onRender: (date) =>
            #     if date.valueOf() < @startDate.date.valueOf() then 'disabled' else ''
        .on 'changeDate', (ev) =>
            @endDate.hide()
            @resetSubmitBtn
        .data('datepicker')

        $('#startTime, #endTime').timepicker
            minuteStep: 5
            defaultTime: 'current'
            template: 'dropdown'

        # Start Time Picker
        @startTime = $('#startTime')

        # End Time Picker
        @endTime = $('#endTime')

        # Input Choice: The delay in results to public
        @resultDelay = $('#result-delay')

        # Checkbox: Whether the election is universal
        @universal = $('#universal-election')

        # Checkbox: Whether the election is hidden
        @hidden = $('#hidden-election')

        # Election link modal
        @linkModal = new LinkModal()

        # Submit Button
        @submitBtn = $('#election-submit')

        # Called when the submit button is clicked. Validates & makes an AJAX call.
        @submitBtn.click =>
            return false if self.submitBtn.hasClass('disabled')
            data = self.toJson()
            return false if not data

            data['method'] = 'update_election'
            self.submitBtn.addClass('disabled')

            $.ajax
                url: postURL
                type: 'POST'
                data: 'data': JSON.stringify(data)
                success: (data) =>
                    response = JSON.parse(data)
                    self.setFromJson(response['election'])
                    self.setSubmitBtn('btn-success', response['msg'])
                    self.submitBtn.addClass('disabled')
                    console.log(response)
                    if response.election.hidden
                        @linkModal.load(response.election.id)
                        @linkModal.show()
                error: (data) ->
                    self.setSubmitBtn('btn-danger', 'Error')
            return true

        # Gives the contents of the form in json form if valid, otherwise null
        InformationForm::toJson = ->
            json =
                'name': @getName()
                'times': @getTimes()
                'result_delay': @getResultDelay()
                'universal': @isUniversal()
                'hidden': @hidden.prop('checked')
            for key, value of json
                return null if value == null
            return json

        # Sets the contents of the form with the given json information
        InformationForm::setFromJson = (json) ->
            return if not json
            @id = json['id']
            @name.val(json['name'])
            start = new Date(json['times']['start'] + ' UTC')
            end = new Date(json['times']['end'] + ' UTC')
            now = new Date()
            startTime = start.toLocaleTimeString()
            endTime = end.toLocaleTimeString()

            # Set date / time picker components
            @startDate.setValue(start)
            if now.valueOf() > start.valueOf()
                @startDate.onRender = (date) -> 'disabled'
            @startDate.update()

            @endDate.setValue(end)
            if now.valueOf() > end.valueOf()
                @endDate.onRender = (date) -> 'disabled'
            @endDate.update()

            @startTime.timepicker('setTime', startTime)
            @endTime.timepicker('setTime', endTime)

            # Set result delay
            delay = json['result_delay']
            if not $("#result-delay option[value=#{delay}]")
                @resultDelay.append(
                    "<option id='custom' value='#{delay}'>#{delay}</option>")
            @resultDelay.val(delay).change()

            # Set universal election
            @universal.prop('checked', json['universal'] == true)

            # Set hidden election
            @hidden.prop('checked', json['hidden'] == true)


        # Resets the submit button ready for use
        InformationForm::resetSubmitBtn = ->
            text = 'Create Election'
            if self.id
                text = 'Update Election'
            self.setSubmitBtn('btn-primary', text)
            self.submitBtn.removeClass('disabled')


        # Sets the submit button to the specified message
        InformationForm::setSubmitBtn = (type, text) ->
            self.restoreDefaultButtonState()
            @submitBtn.addClass(type)
            @submitBtn.text(text)

        InformationForm::restoreDefaultButtonState = ->
            @submitBtn.removeClass('btn-success')
            @submitBtn.removeClass('btn-danger')
            @submitBtn.removeClass('btn-primary')

        # Validates and returns the election name
        InformationForm::getName = ->
            nameContainer = @name.parent().parent()
            nameContainer.removeClass('error')
            $('.errorMsgName').remove()
            if not @name.val()
                nameContainer.addClass('error')
                $("<span class='help-inline errorMsgName'>Please enter election " +
                    "name.</span>").insertAfter(@name)
                return null
            return @name.val()

        # Validates and returns the election times
        InformationForm::getTimes = ->
            timeContainer = $('#startDate').parent().parent()
            startDateInput = @startDate.element.children().filter('input')
            endDateInput = @endDate.element.children().filter('input')
            errorMsg = ''
            for field in [startDateInput, endDateInput, @startTime, @endTime]
                errorMsg = 'Missing information.' if not field.val()

            if not errorMsg
                start = new Date("#{startDateInput.val()} #{@startTime.val()}").valueOf()
                end = new Date("#{endDateInput.val()} #{@endTime.val()}").valueOf()
                start /= 1000
                end /= 1000
                console.log('Start time ' + start + '/ End time: ' + end)
                if start > end
                    errorMsg = 'Start time is later than end time.'
                if start == end
                    errorMsg = 'Start time is the same as end time.'
                if not @id and ((new Date()).valueOf() / 1000) > start
                    errorMsg = 'Start time is in the past.'

            if errorMsg
                timeContainer.addClass('error')
                $('.errorMsgTime').remove()
                @startDate.element.parent().append("<span class='help-inline " +
                    "errorMsgTime'>#{errorMsg}</span>")
                return null
            else
                timeContainer.removeClass('error')
                $('.errorMsgTime').remove()
                return 'start': start, 'end': end

        # Returns the election result delay
        InformationForm::getResultDelay = -> parseInt(@resultDelay.val())

        # Returns whether the election is universal
        InformationForm::isUniversal = -> @universal.prop('checked')

        # Trigger reset buttons on value changes
        for item in [@name, @resultDelay, @universal, @hidden]
            item.change(@resetSubmitBtn)

        for picker in [@startTime, @endTime]
            picker.timepicker().on('changeTime.timepicker', @resetSubmitBtn)

        return # Stops compiler from returning last defined function

    class LinkModal
        constructor: ->
            @el = $('#modal-election-link')
            @link = $('#modal-election-link-text')
            @linkHref = ''
            @copyLink = $('#modal-election-link-copy')
            @clip = new ZeroClipboard(@copyLink, {moviePath: "/static/js/shared/ZeroClipboard.swf", text: 'Hello!'})

            @clip.on 'complete', (client, args) ->
                alert("Copied text to clipboard: #{args.text}")
            # @copyLink.click(@copy)

        load: (id) ->
            host = window.location.host
            @linkHref = "http://#{host}/vote/cast-ballot?id=#{id}"
            linkText = $('<a>', 'href': @linkHref).text(@linkHref)
            @link.text(@linkHref)
            @copyLink.attr('data-clipboard-text', @linkHref)
            @clip = new ZeroClipboard(@copyLink, {moviePath: "/static/js/shared/ZeroClipboard.swf", text: 'Hello!'})

        show: -> @el.modal('show')

    $ ->
        # $('label[rel="tooltip"]').tooltip()
        informationForm = new InformationForm()

        data =
            'method': 'get_election'

        # Get election information from the server
        $.ajax
            url: postURL
            type: 'POST'
            data: 'data': JSON.stringify(data)
            success: (data) ->
                response = JSON.parse(data)
                if response['status'] == 'ERROR'
                    console.log('User not authorized')
                    return
                if response['election']
                    console.log(response['election'])
                    informationForm.setFromJson(response['election'])
                    informationForm.resetSubmitBtn()
            error: (data) ->
                console.log('Unknown Error')

)