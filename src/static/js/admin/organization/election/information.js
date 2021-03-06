var InformationForm, LinkModal, informationForm, postURL;

informationForm = null;

postURL = '/admin/organization/election/information';

jQuery(function() {
  var data;
  $('label[rel="tooltip"]').tooltip();
  informationForm = new InformationForm();
  data = {
    'method': 'get_election'
  };
  return $.ajax({
    url: postURL,
    type: 'POST',
    data: {
      'data': JSON.stringify(data)
    },
    success: function(data) {
      var response;
      response = JSON.parse(data);
      if (response['status'] === 'ERROR') {
        console.log('User not authorized');
        return;
      }
      if (response['election']) {
        console.log(response['election']);
        informationForm.setFromJson(response['election']);
        return informationForm.resetSubmitBtn();
      }
    },
    error: function(data) {
      return console.log('Unknown Error');
    }
  });
});

InformationForm = function() {
  var item, picker, self, _i, _j, _len, _len1, _ref, _ref1;
  self = this;
  this.id = "";
  this.name = $('#name');
  this.startDate = $('#startDate').datepicker().on('changeDate', (function(_this) {
    return function(ev) {
      var newDate;
      if (ev.date.valueOf() > _this.endDate.date.valueOf()) {
        newDate = new Date(ev.date);
        _this.endDate.setValue(newDate);
      }
      _this.startDate.hide();
      _this.resetSubmitBtn;
      return _this.endDate.show();
    };
  })(this)).data('datepicker');
  this.endDate = $('#endDate').datepicker().on('changeDate', (function(_this) {
    return function(ev) {
      _this.endDate.hide();
      return _this.resetSubmitBtn;
    };
  })(this)).data('datepicker');
  $('#startTime, #endTime').timepicker({
    minuteStep: 5,
    defaultTime: 'current',
    template: 'dropdown'
  });
  this.startTime = $('#startTime');
  this.endTime = $('#endTime');
  this.resultDelay = $('#result-delay');
  this.universal = $('#universal-election');
  this.hidden = $('#hidden-election');
  this.description = $('#description');
  this.linkModal = new LinkModal();
  this.submitBtn = $('#election-submit');
  this.submitBtn.click((function(_this) {
    return function() {
      var data;
      if (self.submitBtn.hasClass('disabled')) {
        return false;
      }
      data = self.toJson();
      if (!data) {
        return false;
      }
      data['method'] = 'update_election';
      self.submitBtn.addClass('disabled');
      $.ajax({
        url: postURL,
        type: 'POST',
        data: {
          'data': JSON.stringify(data)
        },
        success: function(data) {
          var response;
          response = JSON.parse(data);
          self.setFromJson(response['election']);
          self.setSubmitBtn('btn-success', response['msg']);
          self.submitBtn.addClass('disabled');
          console.log(response);
          if (response.election.hidden) {
            _this.linkModal.load(response.election.id);
            return _this.linkModal.show();
          }
        },
        error: function(data) {
          return self.setSubmitBtn('btn-danger', 'Error');
        }
      });
      return true;
    };
  })(this));
  InformationForm.prototype.toJson = function() {
    var json, key, value;
    json = {
      'name': this.getName(),
      'times': this.getTimes(),
      'result_delay': this.getResultDelay(),
      'universal': this.isUniversal(),
      'hidden': this.hidden.prop('checked'),
      'description': this.getDescription()
    };
    for (key in json) {
      value = json[key];
      if (value === null) {
        return null;
      }
    }
    return json;
  };
  InformationForm.prototype.setFromJson = function(json) {
    var delay, end, endTime, now, start, startTime;
    if (!json) {
      return;
    }
    this.id = json['id'];
    this.name.val(json['name']);
    start = new Date(json['times']['start'] + ' UTC');
    end = new Date(json['times']['end'] + ' UTC');
    now = new Date();
    startTime = start.toLocaleTimeString();
    endTime = end.toLocaleTimeString();
    this.description.val(json['description']);
    this.startDate.setValue(start);
    if (now.valueOf() > start.valueOf()) {
      this.startDate.onRender = function(date) {
        return 'disabled';
      };
    }
    this.startDate.update();
    this.endDate.setValue(end);
    if (now.valueOf() > end.valueOf()) {
      this.endDate.onRender = function(date) {
        return 'disabled';
      };
    }
    this.endDate.update();
    this.startTime.timepicker('setTime', startTime);
    this.endTime.timepicker('setTime', endTime);
    delay = json['result_delay'];
    if (!$("#result-delay option[value=" + delay + "]")) {
      this.resultDelay.append("<option id='custom' value='" + delay + "'>" + delay + "</option>");
    }
    this.resultDelay.val(delay).change();
    this.universal.prop('checked', json['universal'] === true);
    return this.hidden.prop('checked', json['hidden'] === true);
  };
  InformationForm.prototype.resetSubmitBtn = function() {
    var text;
    text = 'Create Election';
    if (self.id) {
      text = 'Update Election';
    }
    self.setSubmitBtn('btn-primary', text);
    return self.submitBtn.removeClass('disabled');
  };
  InformationForm.prototype.setSubmitBtn = function(type, text) {
    self.restoreDefaultButtonState();
    this.submitBtn.addClass(type);
    return this.submitBtn.text(text);
  };
  InformationForm.prototype.restoreDefaultButtonState = function() {
    this.submitBtn.removeClass('btn-success');
    this.submitBtn.removeClass('btn-danger');
    return this.submitBtn.removeClass('btn-primary');
  };
  InformationForm.prototype.getName = function() {
    var nameContainer;
    nameContainer = this.name.parent().parent();
    nameContainer.removeClass('error');
    $('.errorMsgName').remove();
    if (!this.name.val()) {
      nameContainer.addClass('error');
      $("<span class='help-inline errorMsgName'>Please enter election " + "name.</span>").insertAfter(this.name);
      return null;
    }
    return this.name.val();
  };
  InformationForm.prototype.getDescription = function() {
    return this.description.val();
  };
  InformationForm.prototype.getTimes = function() {
    var end, endDateInput, errorMsg, field, start, startDateInput, timeContainer, _i, _len, _ref;
    timeContainer = $('#startDate').parent().parent();
    startDateInput = this.startDate.element.children().filter('input');
    endDateInput = this.endDate.element.children().filter('input');
    errorMsg = '';
    _ref = [startDateInput, endDateInput, this.startTime, this.endTime];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      field = _ref[_i];
      if (!field.val()) {
        errorMsg = 'Missing information.';
      }
    }
    if (!errorMsg) {
      start = new Date("" + (startDateInput.val()) + " " + (this.startTime.val())).valueOf();
      end = new Date("" + (endDateInput.val()) + " " + (this.endTime.val())).valueOf();
      start /= 1000;
      end /= 1000;
      console.log('Start time ' + start + '/ End time: ' + end);
      if (start > end) {
        errorMsg = 'Start time is later than end time.';
      }
      if (start === end) {
        errorMsg = 'Start time is the same as end time.';
      }
      if (!this.id && ((new Date()).valueOf() / 1000) > start) {
        errorMsg = 'Start time is in the past.';
      }
    }
    if (errorMsg) {
      timeContainer.addClass('error');
      $('.errorMsgTime').remove();
      this.startDate.element.parent().append("<span class='help-inline " + ("errorMsgTime'>" + errorMsg + "</span>"));
      return null;
    } else {
      timeContainer.removeClass('error');
      $('.errorMsgTime').remove();
      return {
        'start': start,
        'end': end
      };
    }
  };
  InformationForm.prototype.getResultDelay = function() {
    return parseInt(this.resultDelay.val());
  };
  InformationForm.prototype.isUniversal = function() {
    return this.universal.prop('checked');
  };
  _ref = [this.name, this.resultDelay, this.universal, this.hidden];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    item = _ref[_i];
    item.change(this.resetSubmitBtn);
  }
  _ref1 = [this.startTime, this.endTime];
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    picker = _ref1[_j];
    picker.timepicker().on('changeTime.timepicker', this.resetSubmitBtn);
  }
};

LinkModal = (function() {
  function LinkModal() {
    this.el = $('#modal-election-link');
    this.link = $('#modal-election-link-text');
    this.linkHref = '';
    this.copyLink = $('#modal-election-link-copy');
    this.clip = new ZeroClipboard(this.copyLink, {
      moviePath: "/static/js/shared/ZeroClipboard.swf",
      text: 'Hello!'
    });
    this.clip.on('complete', function(client, args) {
      return alert("Copied text to clipboard: " + args.text);
    });
  }

  LinkModal.prototype.load = function(id) {
    var host, linkText;
    host = window.location.host;
    this.linkHref = "http://" + host + "/vote/cast-ballot?id=" + id;
    linkText = $('<a>', {
      'href': this.linkHref
    }).text(this.linkHref);
    this.link.text(this.linkHref);
    this.copyLink.attr('data-clipboard-text', this.linkHref);
    return this.clip = new ZeroClipboard(this.copyLink, {
      moviePath: "/static/js/shared/ZeroClipboard.swf",
      text: 'Hello!'
    });
  };

  LinkModal.prototype.show = function() {
    return this.el.modal('show');
  };

  return LinkModal;

})();
