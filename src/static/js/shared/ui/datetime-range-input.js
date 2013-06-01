// Generated by CoffeeScript 1.6.2
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

define(['jquery', 'ui/datetime-input'], function($, DateTimeInput) {
  var DateTimeRangeInput;

  return DateTimeRangeInput = (function() {
    /*
        An input that allows a user to specify a datetime range.
    
        Args:
            startEl: the start datetime element
            endEl: the end datetime element
            options: the options object, delegated to DateTimeInput
                required: whether input is required
                language: language string e.g. 'en'
                pickTime: whether the user can pick time
                pick12HourFormat: whether the user can pick 12 hour format
                pickSeconds: whether user can pick seconds
                required: whether input is required
                pastAllowed: whether past input is allowed
                controlGroup: the control group element
    */
    function DateTimeRangeInput(startEl, endEl, options) {
      var _this = this;

      this.startEl = startEl;
      this.endEl = endEl;
      this.on = __bind(this.on, this);
      this.enableEnd = __bind(this.enableEnd, this);
      this.enableStart = __bind(this.enableStart, this);
      this.disableEnd = __bind(this.disableEnd, this);
      this.disableStart = __bind(this.disableStart, this);
      this.setFromJSON = __bind(this.setFromJSON, this);
      this.toJSON = __bind(this.toJSON, this);
      this.hasInput = __bind(this.hasInput, this);
      this._validate_range = __bind(this._validate_range, this);
      this.required = options.required;
      this.pastAllowed = options.pastAllowed;
      if (!this.pastAllowed) {
        options.startDate = new Date();
      }
      this._startDt = new DateTimeInput($(this.startEl), options);
      this._endDt = new DateTimeInput($(this.endEl), options);
      this._startDt.on('changeDate', function(e) {
        return _this._validate_range();
      });
      this._endDt.on('changeDate', function(e) {
        return _this._validate_range();
      });
    }

    DateTimeRangeInput.prototype._validate_range = function() {
      var valid;

      valid = true;
      if (this._startDt.hasInput()) {
        if (!this.pastAllowed && this._startDt.getDate() < new Date()) {
          this._startDt.controlGroup.setError('Start time cannot be in the past.');
          valid = false;
        }
      }
      if (this._startDt.hasInput() && this._endDt.hasInput()) {
        if (this._endDt.getDate() < this._startDt.getDate()) {
          this._endDt.controlGroup.setError('End time is before start time.');
          valid = false;
        }
      }
      if (valid) {
        this._startDt.controlGroup.removeError();
        this._endDt.controlGroup.removeError();
      }
      return valid;
    };

    DateTimeRangeInput.prototype.hasInput = function() {
      return this._startDt.hasInput() && this._endDt.hasInput();
    };

    DateTimeRangeInput.prototype.toJSON = function() {
      if (this.hasInput()) {
        if (this._validate_range()) {
          return {
            start: this._startDt.getVal(),
            end: this._endDt.getVal()
          };
        } else {
          return null;
        }
      } else {
        if (this.required) {
          this._startDt.controlGroup.setError('Required input.');
        }
        return null;
      }
    };

    DateTimeRangeInput.prototype.setFromJSON = function(vals) {
      this._startDt.setVal(vals.start);
      this._endDt.setVal(vals.end);
      return this._validate_range();
    };

    DateTimeRangeInput.prototype.disableStart = function() {
      return this._startDt.disable();
    };

    DateTimeRangeInput.prototype.disableEnd = function() {
      return this._endDt.disable();
    };

    DateTimeRangeInput.prototype.enableStart = function() {
      return this._startDt.enable();
    };

    DateTimeRangeInput.prototype.enableEnd = function() {
      return this._endDt.enable();
    };

    DateTimeRangeInput.prototype.on = function(e, func) {
      this._startDt.el.on(e, func);
      return this._endDt.el.on(e, func);
    };

    return DateTimeRangeInput;

  })();
});