/*jshint curly:true, eqeqeq:true, immed:true, latedef:true,
  newcap:true, noarg:true, sub:true, undef:true, boss:true,
  strict:false, eqnull:true, browser:true, node:true */

var LilObj = require('lilobj');
var _ = require('lil_');
var syncr = require('./syncr');

module.exports = LilObj.extend({

  construct: function (values) {

    this.$ = [];

    _.each(values, function (value) {
      this.$.push(this.model.create(value));
    }, this);

    this.validate();

  },

  validate: function () {

    var validation = { isValid: true, error: [] };

    _.each(this.$, function ($) {
      
      var v = $.validate();
      validation.error.push(v.error);
      validation.isValid = validation.isValid && v.isValid;

    });

    return validation;

  },

  add: function (obj) {

    var model;
    if (obj.isA && obj.isA(this.model)) {
      model = obj;
    } else {
      model = this.model.create(obj);
    }

    this.$.push(model);
  },

  remove: function (query) {

    this.$ = this.$.filter(function (model) {
      return !_.match(model, query);
    });

  },

  get: function (query) {

    return this.$.filter(function (model) {
      return _.match(model, query);
    });

  },

  find: function (query, next) {
    var sync = syncr();
    sync('find', this, next);
  }

});
