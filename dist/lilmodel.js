/*! lilmodel - v0.0.2 - 2012-12-06
 * Copyright (c) 2012 August Hovland <gushov@gmail.com>; Licensed MIT */

(function (ctx) {

  "use strict";

  var defined = {};
  var exported = {};

  function resolve(from, name) {

    if (name.indexOf('.') === -1) {
      return name;
    }

    name = name.split('/');
    from = from ? from.split('/') : [];
    from.pop();

    if (name[0] === '.') {
      name.shift();
    }

    while(name[0] === '..') {
      name.shift();
      from.pop();
    }

    return from.concat(name).join('/');

  }

  //@TODO handle provide/require/define already in scope

  ctx.provide = function (name, module, isDefinition) {

    if (isDefinition) {
      return defined[name] = module;
    } else {
      return exported[name] = module;
    }

  };

  ctx.require = function (path, canonical) {

    var exports, module;
    var name = canonical || path;

    if (exported[name]) {
      return exported[name];
    } else {

      exports = exported[name] = {};
      module = { exports: exports };
      defined[name](function (path) {
        return ctx.require(path, resolve(name, path));
      }, module, exports);

      return (exported[name] = module.exports);

    }

  };

}(this));
 
provide('lil_', function (require, module, exports) {

/*jshint curly:true, eqeqeq:true, immed:true, latedef:true,
  newcap:true, noarg:true, sub:true, undef:true, boss:true,
  strict:false, eqnull:true, browser:true, node:true */

module.exports = {

  typeOf: function (x) {

    var type = typeof x;

    if (type === 'object') {
      type = Array.isArray(x) ? 'array' : type;
      type = x === null ? 'null' : type;
    }

    return type;

  },

  each: function (arr, func, ctx) {

    if (arr && arr.length) {
      arr.forEach(func, ctx);
    }

  },

  every: function (arr, func, ctx) {

    if (arr && arr.length) {
      return arr.every(func, ctx);
    }
    return false;

  },

  map: function (arr, func, ctx) {

    if (arr && arr.length) {
      return arr.map(func, ctx);
    }
    return [];

  },

  eachIn: function (obj, func, ctx) {

    var keys = obj ? Object.keys(obj) : [];

    keys.forEach(function (name, i) {
      func.call(ctx, name, obj[name], i);
    });

  },

  mapIn: function (obj, func, ctx) {

    var result = {};

    this.eachIn(obj, function (name, obj, i) {
      result[name] = func.call(this, name, obj, i);
    }, ctx);

    return result;

  },

  walk: function (target, source, func, fill) {

    var self = this;

    var walkObj = function (target, source) {

      self.eachIn(source, function (name, obj) {
        step(target[name], obj, name, target);
      });

    };

    var step = function (target, source, name, parent) {

      var type = self.typeOf(source);

      if (type === 'object') {

        if (!target && parent && fill) {
          target = parent[name] = {};
        }
        
        walkObj(target, source);

      } else {
        func.call(parent, target, source, name);
      }

    };

    step(target, source);

  },

  extend: function (obj, src) {

    this.walk(obj, src, function (target, src, name) {
      this[name] = src;
    }, true);

    return obj;

  },

  defaults: function (obj, defaults) {

    this.walk(obj, defaults, function (target, src, name) {

      if (!target) {
        this[name] = src;
      }

    }, true);

    return obj;

  },

  match: function (obj, test) {

    var isMatch = true;

    this.walk(obj, test, function (target, src) {
      isMatch = (target === src);
    });

    return isMatch;

  },

  pick: function(obj, keys) {

    var picked = {};
    keys = this.typeOf(keys) === 'array' ? keys : Object.keys(keys);

    this.each(keys, function (key) {
      picked[key] = obj && obj[key];
    });

    return picked;

  },

  pushOn: function (obj, prop, value) {

    if (obj[prop] && typeof obj[prop].push === 'function') {
      obj[prop].push(value);
    } else if ( typeof obj[prop] === 'undefined' ) {
      obj[prop] = [value];
    }

  }

};

}, true);

provide('lilobj', function (require, module, exports) {

/*jshint curly:true, eqeqeq:true, immed:true, latedef:true,
  newcap:true, noarg:true, sub:true, undef:true, boss:true,
  strict:false, eqnull:true, browser:true, node:true */

var _ = require('lil_');

module.exports = {

  isA: function (prototype) {

    function D() {}
    D.prototype = prototype;
    return this instanceof D;

  },

  extend: function (props) {

    var result = Object.create(this);

    _.eachIn(props, function (name, value) {
      result[name] = value;
    });

    return result;

  },

  create: function () {

    var object = Object.create(this);

    if (object.construct !== undefined) {
      object.construct.apply(object, arguments);
    }

    return object;

  }

};


}, true);

provide('vladiator', function (require, module, exports) {

/*jshint curly:true, eqeqeq:true, immed:true, latedef:true,
  newcap:true, noarg:true, sub:true, undef:true, boss:true,
  strict:false, eqnull:true, browser:true, node:true */

var _ = require('lil_');

var validator = {

  required: function (value) {
    return typeof value !== 'undefined' && value !== null;
  },

  array: function (value) {
    return Array.isArray(value);
  },

  number: function (value) {
    return typeof value === 'number';
  },

  string: function (value) {
    return typeof value === 'string';
  },

  length: function (value, min, max) {

    var isBigEnough = !min || value.length >= min;
    var isSmallEnough = !max || value.length <= max;
    return isBigEnough && isSmallEnough;

  },

  gte: function (value, min) {
    return value >= min;
  }

};

var validate = function (rules, value) {

  var result = { isValid: true };
  
  if (rules[0] === 'required' || validator.required(value)) {

    _.every(rules, function(signature) {

      var method, args = [];

      if (typeof signature !== 'string') {
        method = signature[0];
        args = signature.slice(1);
      } else {
        method = signature;
      }
      
      args.unshift(value);
      
      if (!validator[method].apply(null, args)) {
        result.isValid = false;
        result.error = method;
        return false;
      }
      return true;

    });

  }

  result.$ = value;
  return result;

};

module.exports = validate;


}, true);

provide('lilmodel/collection', function (require, module, exports) {

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


}, true);
provide('lilmodel/model', function (require, module, exports) {

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

  save: function (next) {

    var sync = syncr();
    var method = this.$._id ? 'update' : 'create';
    var validation = this.validate();

    if (validation.isValid) {
      sync(method, this, next);
    } else {
      next(validation.error, this);
    }

  },

  fetch: function (next) {
    var sync = syncr();
    sync('fetch', this, next);
  },

  destroy: function (next) {
    var sync = syncr();
    sync('delete', this, next);
  }

});


}, true);
provide('lilmodel/syncr', function (require, module, exports) {

/*jshint curly:true, eqeqeq:true, immed:true, latedef:true,
  newcap:true, noarg:true, sub:true, undef:true, boss:true,
  strict:false, eqnull:true, browser:true, node:true */

var sync = function (method, obj, next) {
  next(null, obj);
};

module.exports = function (handler) {

  if (handler) { sync = handler; }
  return sync;

};


}, true);
provide('lilmodel', function (require, module, exports) {

/*jshint curly:true, eqeqeq:true, immed:true, latedef:true,
  newcap:true, noarg:true, sub:true, undef:true, boss:true,
  strict:false, eqnull:true, browser:true, node:true */

var syncr = require('./lilmodel/syncr');
var model = require('./lilmodel/model');
var collection = require('./lilmodel/collection');

module.exports = {
  syncr: syncr,
  model: model,
  collection: collection
};


}, true);
