// Generated by CoffeeScript 1.6.2
var informationForm;

informationForm = null;

define(function(require) {
  var $, InformationForm, TextInput;

  $ = require('jquery');
  TextInput = require('bootstrap-ui/text-input');
  InformationForm = (function() {
    function InformationForm() {
      this.id = "";
      this.name = new TextInput($('#name'), {
        required: true,
        controlGroup: $('#name').parent().parent()
      });
    }

    return InformationForm;

  })();
  informationForm = new InformationForm();
  return console.log(informationForm);
});
