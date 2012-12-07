/*jshint curly:true, eqeqeq:true, immed:true, latedef:true,
  newcap:true, noarg:true, sub:true, undef:true, boss:true,
  strict:false, eqnull:true, browser:true, node:true */

var LilObj = require('lilobj');
var _ = require('lil_');
var vlad = require('vladiator');
var syncr = require('./syncr');

module.exports = LilObj.extend({

  construct: function (values) {

    this.$ = {};
    var props = _.mapIn(this.rules, function (name, value) {

      return {

        enumerable : true,

        get: function () {
          return this.$[name];
        },

        set: function (value) {

          var model = this.children && this.children[name];

          if (model && model.create && typeof value === 'object') {
            this.$[name] = model.create(value);
          } else if (model && typeof value === 'object') {
            this.$[name] = this.create(value);
          } else if (!model) {
            this.$[name] = value;
          }

        }

      };

    }, this);

    Object.defineProperties(this, props);

    values = _.pick(values, this.rules);
    _.defaults(values, this.defaults);

    _.eachIn(values, function (name, value) {
      this[name] = value;
    }, this);

    this.validate();

  },

  validate: function () {

    var validation = { isValid: true, error: {} };

    _.eachIn(this.rules, function (prop, rules) {

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
      sync(method, this, next.bind(ctx));
    } else {
      next.call(ctx, validation.error, this);
    }

  },

  fetch: function (next, ctx) {
    var sync = syncr();
    sync('fetch', this, next.bind(ctx));
  },

  destroy: function (next, ctx) {
    var sync = syncr();
    sync('destroy', this, next.bind(ctx));
  }

});
