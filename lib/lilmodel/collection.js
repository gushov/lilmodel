/*jshint curly:true, eqeqeq:true, immed:true, latedef:true,
  newcap:true, noarg:true, sub:true, undef:true, boss:true,
  strict:false, eqnull:true, browser:true, node:true */

var arr = require('lilobj').arr;
var _ = require('lil_');
var syncr = require('./syncr');

function parser(ctx, model, next) {

  return function (err, values) {

    var instance = !err && model.create(values);
    next.call(ctx, err, instance);

  };

}

module.exports = arr.extend({

  construct: function (values) {

    _.each(values, function (value) {
      this.push(this.model.create(value));
    }, this);

    this.validate();

  },

  validate: function () {

    var validation = { isValid: true, error: [] };

    _.each(this, function (model) {
      
      var v = model.validate();
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

    this.push(model);
  },

  remove: function (query) {

    var index;

    _.each(this, function (model, i) {

      if (_.match(model, query)) {
        index = i;
      }

    });

    if (typeof index === 'number') {
      this.splice(index, 1);
    }

  },

  get: function (query) {

    return this.filter(function (model) {
      return _.match(model, query);
    });

  },

  find: function (query, next, ctx) {

    var sync = syncr();
    this.query = query;
    sync('find', this, parser(ctx, this, next));

  },

  serialize: function () {

    return _.map(this, function (elem) {
      return elem.serialize();
    });

  }

});
