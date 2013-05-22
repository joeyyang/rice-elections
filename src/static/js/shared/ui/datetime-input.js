// Generated by CoffeeScript 1.6.2
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

define(['jquery', 'ui/control-group', 'bootstrap-datetimepicker'], function($, ControlGroup, DateTimePicker) {
  var DateTimeInput;

  require('bootstrap-datetimepicker');
  return DateTimeInput = (function() {
    function DateTimeInput(el, options) {
      this.el = el;
      if (options == null) {
        options = {};
      }
      this.setEndDate = __bind(this.setEndDate, this);
      this.setStartDate = __bind(this.setStartDate, this);
      this.disable = __bind(this.disable, this);
      this.enable = __bind(this.enable, this);
      this.hide = __bind(this.hide, this);
      this.show = __bind(this.show, this);
      this.on = __bind(this.on, this);
      this.setVal = __bind(this.setVal, this);
      this.setDate = __bind(this.setDate, this);
      this.getVal = __bind(this.getVal, this);
      this.getDate = __bind(this.getDate, this);
      this.hasInput = __bind(this.hasInput, this);
      this.el.datetimepicker(options);
      this._picker = this.el.data('datetimepicker');
      this.required = options.required || false;
      this.controlGroup = new ControlGroup(options.controlGroup);
    }

    DateTimeInput.prototype.hasInput = function() {
      if (this.el.children('input').val()) {
        return true;
      } else {
        return false;
      }
    };

    DateTimeInput.prototype.getDate = function() {
      if (this.hasInput()) {
        return this._picker.getLocalDate();
      } else {
        return null;
      }
    };

    DateTimeInput.prototype.getVal = function() {
      if (this.hasInput()) {
        return Math.round(this.getDate().valueOf() / 1000);
      } else {
        if (this.required) {
          this.controlGroup.setError('Required field.');
        }
        return null;
      }
    };

    DateTimeInput.prototype.setDate = function(date) {
      return this._picker.setDate(date);
    };

    DateTimeInput.prototype.setVal = function(val) {
      return this.setDate(new Date(val * 1000));
    };

    DateTimeInput.prototype.on = function(e, func) {
      return this.el.on(e, func);
    };

    DateTimeInput.prototype.show = function() {
      return this._picker.show();
    };

    DateTimeInput.prototype.hide = function() {
      return this._picker.hide();
    };

    DateTimeInput.prototype.enable = function() {
      return this._picker.enable();
    };

    DateTimeInput.prototype.disable = function() {
      return this._picker.disable();
    };

    DateTimeInput.prototype.setStartDate = function(date) {
      this._picker.startDate = date;
      return this._picker.update();
    };

    DateTimeInput.prototype.setEndDate = function(date) {
      this._picker.endDate = date;
      return this._picker.update();
    };

    return DateTimeInput;

  })();
});
