/**
 * lilmodel
 * https://github.com/ahovland-nokia/model
 *
 * Copyright (c) 2012 August Hovland
 * Licensed under the MIT license.
 */

(function (exports) {

  "use strict";

  var sync;
  var model = {
    /**
     * Create instance of model
     */
    create: function (attrs) {

      var instance = Object.create(this, {
        attrs: {
          value: {},
          writable: true,
          enumerable: false,
          configurable : false
        }
      });

      return instance.init(attrs);

    },

    /**
     * Create a collection of models
     */
    collection: function (attrs) {

      var models = [];

      if (attrs && attrs.length) {

        models =  attrs.map(function (attr) {
          return Object.getPrototypeOf(attr) === this ? attr : this.create(attr);
        }.bind(this));

      }

      return models;

    },

    /**
     * Model init function sets property values
     */
    init: function (attrs) {

      var config = this.config;

      Object.keys(config).forEach(function (prop) {

        var dfault = config && typeof config[prop] !== 'function' ? config[prop] : undefined;
        this[prop] = attrs && typeof attrs[prop] !== 'undefined' ? attrs[prop] : dfault;

      }.bind(this));

      return this;
    },

    /**
     * Method should be overridden to validate this.attrs values
     */
    validate: function () {
      return { isValid: true };
    },

    /**
     * If model is valid call sync save
     */
    save: function (next) {

      var validator = this.validate();
      var method = this._id ? 'update' : 'create';

      if (validator.isValid) {
        sync(method, this, next);
      } else {
        next(validator.error);
      }

    },

    /**
     * Call sync fetch
     */
    fetch: function (next) {
      sync('fetch', this, next);
    },

    /**
     * Call sync find
     */
    find: function (next) {
      sync('find', this, next);
    },

    /**
     * Call sync destroy
     */
    destroy: function (next) {
      sync('delete', this, next);
    },

    //******** DELETE TEMP FUNCTION*********//
    serialize: function () {
      return this;
    }
  };

  exports.sync = function (handler) {

    sync = function (method, model, next) {

      handler(method, model, function (err, result) {

        if (err) {
          next(err);
        } else if (result && typeof result.length === 'number') {
          next(err, model.collection(result));
        } else {
          next(err, model.create(result));
        }

      });

    };

  };

  exports.model = function (props) {

    var instance = Object.create(model);

    Object.keys(props).forEach(function (prop) {

      var isModel = typeof props[prop] === 'function';

      Object.defineProperty(instance, prop, {

        get: function () {
          return typeof this.attrs[prop] !== 'undefined' ? this.attrs[prop] :  '';
        },

        set: function (value) {
          this.attrs[prop] = isModel ? props[prop](value) : value;
        }

      });

    });

    Object.defineProperty(instance, 'config', {
      value: props,
      writable: true,
      enumerable: false,
      configurable: false
    });

    return instance;

  };

}(typeof exports === 'undefined' ? (this.lilmodel = {}) : exports));
