/*! lilmodel - v0.0.9 - 2013-01-25
 * Copyright (c) 2013 August Hovland <gushov@gmail.com>; Licensed MIT */

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

  each: function (thing, func, ctx) {

    var type = this.typeOf(thing);
    var keys;

    if (type === 'array' && thing.length) {

      thing.forEach(func, ctx);

    } else if (type === 'object') {

      keys = thing ? Object.keys(thing) : [];

      keys.forEach(function (name, i) {
        func.call(ctx, name, thing[name], i);
      });

    }

  },

  every: function (thing, func, ctx) {

    var type = this.typeOf(thing);
    var keys;

    if (type === 'array' && thing.length) {

      return thing.every(func, ctx);

    } else if (type === 'object') {

      keys = thing ? Object.keys(thing) : [];

      return keys.every(function (name, i) {
        return func.call(ctx, name, thing[name], i);
      });

    }

    return false;

  },

  some: function (thing, func, ctx) {

    var type = this.typeOf(thing);
    var keys;

    if (type === 'array' && thing.length) {

      return thing.some(func, ctx);

    } else if (type === 'object') {

      keys = thing ? Object.keys(thing) : [];

      return keys.some(function (name, i) {
        return func.call(ctx, name, thing[name], i);
      });

    }

    return false;

  },

  map: function (thing, func, ctx) {

    var type = this.typeOf(thing);
    var result = [];

    if (type === 'array' && thing.length) {

      return thing.map(func, ctx);

    } else if (type === 'object') {

      result = {};

      this.each(thing, function (name, obj, i) {
        result[name] = func.call(this, name, obj, i);
      }, ctx);

    }

    return result;

  },

  withOut: function (arr, value) {

    var result = [];

    this.each(arr, function (element) {

      if (element !== value) {
        result.push(element);
      }

    });

    return result;

  },

  walk: function (target, source, func, fill) {
 
    var self = this;
 
    var walkObj = function (target, source) {
 
      self.each(source, function (name, obj) {
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

  extend: function () {

    var args = Array.prototype.slice.call(arguments);
    var target = args.shift();

    this.each(args, function (src) {

      this.each(src, function (name, value) {
        target[name] = value;
      });

    }, this);

    return target;

  },

  defaults: function (target, defaults) {

    this.each(defaults, function (name, value) {

      var type = this.typeOf(target[name]);
      if (type === 'undefined' || type === 'null') {
        target[name] = value;
      }

    }, this);

    return target;

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

  }

};

}, true);

provide('lilobj/arr', function (require, module, exports) {

/*jshint curly:true, eqeqeq:true, immed:true, latedef:true,
  newcap:true, noarg:true, sub:true, undef:true, boss:true,
  strict:false, eqnull:true, browser:true, node:true,
  proto:true */

var _ = require('lil_');

function Arr() {

  var arr = [];
  arr.push.apply(arr, arguments);
  arr.__proto__ = Arr.prototype;

  return arr;

}

Arr.prototype = [];

Arr.prototype.isA = function (prototype) {

  function D() {}
  D.prototype = prototype;
  return this instanceof D;

};

Arr.prototype.extend = function (props) {

    Arr.prototype = this;
    var child = new Arr();

    _.each(props, function (name) {
      child[name] = props[name];
    });

    return child;
};

Arr.prototype.create = function () {

    Arr.prototype = this;
    var child = new Arr();

    if (child.construct !== undefined) {
      child.construct.apply(child, arguments);
    }

    return child;
};

module.exports = new Arr();


}, true);
provide('lilobj/obj', function (require, module, exports) {

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

    _.each(props, function (name, value) {
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
provide('lilobj', function (require, module, exports) {

/*jshint curly:true, eqeqeq:true, immed:true, latedef:true,
  newcap:true, noarg:true, sub:true, undef:true, boss:true,
  strict:false, eqnull:true, browser:true, node:true */

var obj = require('./lilobj/obj');
var arr = require('./lilobj/arr');

module.exports = {
  obj: obj,
  arr: arr
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

  boolean: function (value) {
    return typeof value === 'boolean';
  },

  object: function (value) {
    return typeof value === 'object';
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

  }

});


}, true);
provide('lilmodel/model', function (require, module, exports) {

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
