/*jshint curly:true, eqeqeq:true, immed:true, latedef:true,
  newcap:true, noarg:true, sub:true, undef:true, boss:true,
  strict:false, eqnull:true, browser:true, node:true */

var obj = require('lilobj').obj;
var _ = require('lil_');
var vlad = require('vladiator');
var syncr = require('./syncr');

function getter(name) {
  return this.$[name];
}

function setter(name, value)   {

  var model = this.children && this.children[name];

  if (model && model.create && typeof value === 'object') {
    this.$[name] = model.create(value);
  } else if (model && typeof value === 'object') {
    this.$[name] = this.create(value);
  } else if (!model) {
    this.$[name] = value;
  }

}

function parser(ctx, model, next) {

  return function (err, values) {

    var instance = !err ? model.create(values) : null;
    next.call(ctx, err, instance);

  };

}

module.exports = obj.extend({

  construct: function (values) {

    this.$ = {};
    var props = _.map(this.rules, function (name, value) {

      return {
        enumerable: true,
        get: getter.bind(this, name),
        set: setter.bind(this, name)
      };

    }, this);

    Object.defineProperties(this, props);

    values = _.pick(values, this.rules);
    _.defaults(values, this.defaults);

    _.each(values, function (name, value) {
      this[name] = value;
    }, this);

    this.validate();

  },

  validate: function () {

    var validation = { isValid: true, error: {} };

    _.each(this.rules, function (prop, rules) {

      var value = this[prop];
      var v;

      if (value && value.validate) {
        v = value.validate();
      } else {
        v = vlad(rules, value);
        value = v.$;
      }

      validation.error[prop] = v.error;
      validation.isValid = validation.isValid && v.isValid;

    }, this);

    return validation;

  },

  save: function (next, ctx) {

    var sync = syncr();
    var method = this.$._id ? 'update' : 'create';
    var validation = this.validate();

    if (validation.isValid) {
      sync(method, this, parser(ctx, this, next));
    } else {
      next.call(ctx, validation.error, this);
    }

  },

  fetch: function (next, ctx) {

    var sync = syncr();
    sync('fetch', this, parser(ctx, this, next));

  },

  destroy: function (next, ctx) {

    var sync = syncr();
    sync('destroy', this, parser(ctx, this, next));
    
  }

});
