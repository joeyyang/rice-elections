// Generated by CoffeeScript 1.6.2
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

define(['jquery'], function($) {
  var Button;

  return Button = (function() {
    function Button(el) {
      this.el = el;
      this.disabled = __bind(this.disabled, this);
      this.set = __bind(this.set, this);
      this.setFromJSON = __bind(this.setFromJSON, this);
    }

    Button.prototype.setFromJSON = function(json) {
      if (json.type === 'ok') {
        return this.set('disabled btn btn-success', json.message);
      } else {
        return this.set('disabled btn btn-danger', json.message || 'Unknown error');
      }
    };

    Button.prototype.set = function(btnClass, msg) {
      this.el.attr('class', btnClass);
      return this.el.text(msg);
    };

    Button.prototype.disabled = function() {
      return this.el.hasClass('disabled');
    };

    return Button;

  })();
});
