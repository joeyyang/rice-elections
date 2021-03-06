// Generated by CoffeeScript 1.6.2
(function() {
  var CumulativeVotingPosition, Form, Position, RankedVotingPosition, all_positions, cumulativeModal, form, postUrl, rankedModal,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  all_positions = [];

  rankedModal = null;

  cumulativeModal = null;

  form = null;

  postUrl = '/admin/organization/election/positions';

  jQuery(function() {
    rankedModal = new RankedVotingPosition();
    cumulativeModal = new CumulativeVotingPosition();
    return form = new Form();
  });

  Form = (function() {
    function Form() {
      this.editPosition = __bind(this.editPosition, this);
      this.createPositionHTML = __bind(this.createPositionHTML, this);
      var data,
        _this = this;

      this.positions = [];
      $("a[href=#modal-ranked]").click(function() {
        return rankedModal.reset();
      });
      $("a[href=#modal-cumulative]").click(function() {
        return cumulativeModal.reset();
      });
      data = {
        'method': 'get_positions'
      };
      $.ajax({
        url: postUrl,
        type: 'POST',
        data: {
          'data': JSON.stringify(data)
        },
        success: function(data) {
          var position, response, _i, _len, _ref, _results;

          response = JSON.parse(data);
          console.log(response);
          _ref = response['positions'];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            position = _ref[_i];
            _results.push(_this.createPositionHTML(position));
          }
          return _results;
        },
        error: function(data) {
          return console.log('Unknown error');
        }
      });
    }

    Form.prototype.createPositionHTML = function(position) {
      var html,
        _this = this;

      html = $('<tr>', {
        style: 'padding-bottom:5px;'
      }).append($('<td>').append($('<i>', {
        "class": 'icon-user'
      })).append(" " + position['name'])).append($('<td>').append($('<a>', {
        href: '#',
        "class": 'edit-position'
      }).append("Edit")).append(" &middot; ").append($('<a>', {
        href: '#',
        "class": 'delete-position'
      }).append("Delete")));
      console.log(html);
      $('#positions').append(html);
      $('#no-positions').hide();
      html.hide().slideDown(500);
      html.children().children().filter('.edit-position').click(function() {
        var data;

        data = {
          'method': 'get_position',
          'id': position['id']
        };
        return $.ajax({
          url: postUrl,
          type: 'POST',
          data: {
            'data': JSON.stringify(data)
          },
          success: function(data) {
            var response;

            response = JSON.parse(data);
            position = response['position'];
            return _this.editPosition(position);
          }
        });
      });
      return html.children().children().filter('.delete-position').click(function() {
        $('.position-name').html(position['name']);
        $('#modal-confirmation').modal('show');
        $('#delete-position-yes').unbind("click");
        return $('#delete-position-yes').click(function() {
          var data;

          $('#modal-confirmation').modal('hide');
          data = {
            'method': 'delete_position',
            'id': position['id']
          };
          return $.ajax({
            url: postUrl,
            type: 'POST',
            data: {
              'data': JSON.stringify(data)
            },
            success: function(data) {
              var response;

              response = JSON.parse(data);
              if (response['status'] === 'OK') {
                return html.slideUp(500);
              }
            }
          });
        });
      });
    };

    Form.prototype.editPosition = function(position) {
      if (position['type'] === 'Ranked-Choice') {
        rankedModal.reset();
        rankedModal.setFromJson(position);
        return $("#modal-ranked").modal('show');
      } else if (position['type'] === 'Cumulative-Voting') {
        cumulativeModal.reset();
        cumulativeModal.setFromJson(position);
        return $("#modal-cumulative").modal('show');
      }
    };

    return Form;

  })();

  Position = (function() {
    function Position(type) {
      this.type = type;
      this.addCandidateSlot = __bind(this.addCandidateSlot, this);
      this.restoreDefaultButtonState = __bind(this.restoreDefaultButtonState, this);
      this.setSubmitBtn = __bind(this.setSubmitBtn, this);
      this.resetSubmitBtn = __bind(this.resetSubmitBtn, this);
      this.submitData = __bind(this.submitData, this);
      this.reset = __bind(this.reset, this);
      this.setFromJson = __bind(this.setFromJson, this);
      this.toJson = __bind(this.toJson, this);
      this.id = null;
      this.type = type;
      this.candidateIDGen = 0;
      this.candidateIDs = [];
      this.candidateIDPrefix = "position-" + this.type + "-candidate-";
      this.addCandidate = $("#position-" + this.type + "-add-candidate");
      this.candidates = $("#position-" + this.type + "-candidates");
      this.name = $("#position-" + this.type + "-name");
      this.writeInSlots = $("#position-" + this.type + "-write-in");
      this.voteRequired = $("#position-" + this.type + "-required");
      this.submit = $("#modal-" + this.type + "-submit");
      this.description = $("#position-" + this.type + "-description");
      this.submit.click(this.submitData);
      this.addCandidate.click(this.addCandidateSlot);
    }

    Position.prototype.toJson = function() {
      var key, position, _i, _len, _ref;

      position = {
        'id': this.id,
        'name': this.getName(),
        'candidates': this.getCandidates(),
        'write_in_slots': this.getWriteInSlots(),
        'vote_required': this.hasVoteRequirement(),
        'description': this.getDescription()
      };
      _ref = ['name', 'candidates', 'write_in_slots', 'vote_required'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        if (position[key] === null) {
          return null;
        }
      }
      return position;
    };

    Position.prototype.setFromJson = function(json) {
      var candidate, id, index, _i, _len, _ref;

      if (!json) {
        return;
      }
      this.reset();
      this.id = json['id'];
      this.writeInSlots.val(json['write_in_slots']);
      this.voteRequired.prop('checked', json['vote_required']);
      this.name.val(json['name']);
      this.description.val(json['description']);
      _ref = json['candidates'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        candidate = _ref[_i];
        this.addCandidateSlot();
        index = this.candidateIDGen - 1;
        id = this.candidateIDPrefix + index;
        $("#" + id + "-name").val(candidate['name']);
        $("#" + id + "-name").data('id', candidate['id']);
      }
      return this.resetSubmitBtn();
    };

    Position.prototype.reset = function() {
      var candidatesContainer, nameContainer, slotsContainer;

      this.candidateIDs = [];
      this.candidates.children().remove();
      this.name.val('').change();
      this.voteRequired.prop('checked', false);
      this.id = null;
      this.resetSubmitBtn();
      this.description.val("");
      nameContainer = this.name.parent().parent();
      nameContainer.removeClass('error');
      $('.errorMsgPositionName').remove();
      candidatesContainer = this.candidates.parent().parent();
      $('.errorMsgCandidateName').remove();
      candidatesContainer.removeClass('error');
      slotsContainer = this.writeInSlots.parent().parent();
      slotsContainer.removeClass('error');
      return $('.errorMsgWSlots').remove();
    };

    Position.prototype.submitData = function(e) {
      var data, method, position,
        _this = this;

      position = this.toJson();
      if (position === null) {
        return false;
      }
      method = 'add_position';
      if (this.id) {
        method = 'update_position';
      }
      data = {
        'method': method,
        'position': position
      };
      return $.ajax({
        url: postUrl,
        type: 'POST',
        data: {
          'data': JSON.stringify(data)
        },
        success: function(data) {
          var response;

          response = JSON.parse(data);
          if (response['status'] === 'ERROR') {
            _this.setSubmitBtn('btn-danger', response['msg']);
            console.log("Error: " + response['msg']);
            return;
          }
          if (response['status'] === 'OK') {
            $("#modal-" + _this.type).modal('hide');
            _this.reset();
            if (method === 'add_position') {
              return form.createPositionHTML(response['position']);
            }
          }
        },
        error: function(data) {
          return _this.setSubmitBtn('btn-danger', 'Error');
        }
      });
    };

    Position.prototype.resetSubmitBtn = function() {
      var text;

      text = 'Create Position';
      if (this.id) {
        text = 'Update Position';
      }
      this.setSubmitBtn('btn-primary', text);
      return this.submit.removeClass('disabled');
    };

    Position.prototype.setSubmitBtn = function(type, text) {
      this.restoreDefaultButtonState();
      this.submit.addClass(type);
      return this.submit.text(text);
    };

    Position.prototype.restoreDefaultButtonState = function() {
      var cl, _i, _len, _ref, _results;

      _ref = ['btn-success', 'btn-danger', 'btn-primary'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cl = _ref[_i];
        _results.push(this.submit.removeClass(cl));
      }
      return _results;
    };

    Position.prototype.addCandidateSlot = function() {
      var candidateInput, id, index,
        _this = this;

      index = this.candidateIDGen++;
      id = this.candidateIDPrefix + index;
      candidateInput = $('<div/>', {
        "class": 'input-append'
      }).append($('<input>', {
        type: 'text',
        "class": 'input-xlarge, input-margin-right',
        id: "" + id + "-name",
        name: "" + id + "-name",
        width: '200px',
        placeholder: 'Full Name'
      })).append($('<span/>', {
        "class": 'add-on',
        id: "" + id
      }).append($('<i/>', {
        "class": 'icon-remove'
      })));
      this.candidates.append(candidateInput);
      candidateInput.hide().fadeIn(500);
      this.candidateIDs.push(index);
      return $("#" + id).click(function() {
        var indexPtr;

        indexPtr = _this.candidateIDs.indexOf(index);
        if (indexPtr !== -1) {
          _this.candidateIDs.splice(indexPtr, 1);
        }
        return $("#" + id).parent().fadeOut(500);
      });
    };

    Position.prototype.getName = function() {
      var nameContainer;

      nameContainer = this.name.parent().parent();
      nameContainer.removeClass('error');
      $('.errorMsgPositionName').remove();
      if (!this.name.val()) {
        nameContainer.addClass('error');
        $('<span class="help-inline errorMsgPositionName">Missing ' + 'information.</span>').insertAfter(this.name);
        return null;
      }
      return this.name.val();
    };

    Position.prototype.getName = function() {
      var nameContainer;

      nameContainer = this.name.parent().parent();
      nameContainer.removeClass('error');
      $('.errorMsgPositionName').remove();
      if (!this.name.val()) {
        nameContainer.addClass('error');
        $('<span class="help-inline errorMsgPositionName">Missing ' + 'information.</span>').insertAfter(this.name);
        return null;
      }
      return this.name.val();
    };

    Position.prototype.getDescription = function() {
      return this.description.val();
    };

    Position.prototype.getCandidates = function() {
      var can, canData, canId, canList, container, missing, nameInput, _i, _len, _ref;

      missing = false;
      container = this.candidates.parent().parent();
      canList = [];
      _ref = this.candidateIDs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        can = _ref[_i];
        nameInput = $("#position-" + this.type + "-candidate-" + can + "-name");
        if (nameInput.val() === '') {
          missing = true;
        } else {
          canData = {
            'name': nameInput.val()
          };
          canId = nameInput.data('id');
          if (canId) {
            canData['id'] = canId;
          }
          canList.push(canData);
        }
      }
      $('.errorMsgCandidateName').remove();
      container.removeClass('error');
      if (missing) {
        container.addClass('error');
        $('<span class="help-inline errorMsgCandidateName">' + 'Missing information.</span>').insertAfter(this.candidates);
        return null;
      }
      return canList;
    };

    Position.prototype.getWriteInSlots = function() {
      var max, min, slotsContainer, val;

      slotsContainer = this.writeInSlots.parent().parent();
      val = parseInt(this.writeInSlots.val());
      min = parseInt(this.writeInSlots.attr('min'));
      max = parseInt(this.writeInSlots.attr('max'));
      slotsContainer.removeClass('error');
      $('.errorMsgWSlots').remove();
      if (!(min <= val && val <= max)) {
        slotsContainer.addClass('error');
        $('<span class="help-inline errorMsgWSlots">Out of valid range.' + '</span>').insertAfter(this.writeInSlots);
        return null;
      }
      if (this.candidateIDs.length === 0 && val === 0) {
        slotsContainer.addClass('error');
        $('<span class="help-inline errorMsgWSlots">Must have atleast a ' + 'single write in slot if no candidates are specified.' + '</span>').insertAfter(this.writeInSlots);
        return null;
      }
      return val;
    };

    Position.prototype.hasVoteRequirement = function() {
      return this.voteRequired.prop('checked');
    };

    return Position;

  })();

  RankedVotingPosition = (function(_super) {
    __extends(RankedVotingPosition, _super);

    function RankedVotingPosition() {
      this.setFromJson = __bind(this.setFromJson, this);
      this.toJson = __bind(this.toJson, this);      RankedVotingPosition.__super__.constructor.call(this, 'ranked');
    }

    RankedVotingPosition.prototype.toJson = function() {
      var position;

      position = RankedVotingPosition.__super__.toJson.call(this);
      if (position === null) {
        return null;
      }
      position['type'] = 'Ranked-Choice';
      return position;
    };

    RankedVotingPosition.prototype.setFromJson = function(json) {
      return RankedVotingPosition.__super__.setFromJson.call(this, json);
    };

    return RankedVotingPosition;

  })(Position);

  CumulativeVotingPosition = (function(_super) {
    __extends(CumulativeVotingPosition, _super);

    function CumulativeVotingPosition() {
      this.setFromJson = __bind(this.setFromJson, this);
      this.toJson = __bind(this.toJson, this);      CumulativeVotingPosition.__super__.constructor.call(this, 'cumulative');
      this.points = $('#position-cumulative-points');
      this.slots = $('#position-cumulative-slots');
    }

    CumulativeVotingPosition.prototype.getPoints = function() {
      var max, min, pointsContainer, val;

      pointsContainer = this.points.parent().parent();
      val = parseInt(this.points.val());
      min = parseInt(this.points.attr('min'));
      max = parseInt(this.points.attr('max'));
      pointsContainer.removeClass('error');
      $('.errorMsgPoints').remove();
      if (!(min <= val && val <= max)) {
        pointsContainer.addClass('error');
        $('<span class="help-inline errorMsgPoints">Out of valid range.' + '</span>').insertAfter(this.points);
        return null;
      }
      return val;
    };

    CumulativeVotingPosition.prototype.getSlots = function() {
      var max, min, slotsContainer, val;

      slotsContainer = this.slots.parent().parent();
      val = parseInt(this.slots.val());
      min = parseInt(this.slots.attr('min'));
      max = parseInt(this.slots.attr('max'));
      slotsContainer.removeClass('error');
      $('.errorMsgPSlots').remove();
      if (!(min <= val && val <= max)) {
        slotsContainer.addClass('error');
        $('<span class="help-inline errorMsgPSlots">Out of valid range.' + '</span>').insertAfter(this.slots);
        return null;
      } else if (val > this.candidateIDs.length && this.getWriteInSlots() < 1) {
        slotsContainer.addClass('error');
        $('<span class="help-inline errorMsgPSlots">Number of ' + 'slots exceed number of candidates.</span>').insertAfter(this.slots);
        return null;
      }
      return val;
    };

    CumulativeVotingPosition.prototype.reset = function() {
      var pointsContainer, slotsContainer;

      CumulativeVotingPosition.__super__.reset.call(this);
      this.slots.val('1').change();
      pointsContainer = this.points.parent().parent();
      pointsContainer.removeClass('error');
      $('.errorMsgPoints').remove();
      slotsContainer = this.slots.parent().parent();
      slotsContainer.removeClass('error');
      return $('.errorMsgPSlots').remove();
    };

    CumulativeVotingPosition.prototype.toJson = function() {
      var json, key, position, value;

      position = CumulativeVotingPosition.__super__.toJson.call(this);
      if (position === null) {
        return null;
      }
      json = {
        'type': 'Cumulative-Voting',
        'slots': this.getSlots(),
        'points': this.getPoints()
      };
      for (key in json) {
        value = json[key];
        if (value === null) {
          return null;
        }
        position[key] = value;
      }
      return position;
    };

    CumulativeVotingPosition.prototype.setFromJson = function(json) {
      CumulativeVotingPosition.__super__.setFromJson.call(this, json);
      this.points.val(json['points']);
      return this.slots.val(json['slots']);
    };

    return CumulativeVotingPosition;

  })(Position);

}).call(this);
