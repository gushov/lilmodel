# lilmodel

A li'l backbone-ish model object.

## Browser usage

load dist/lilobj.js or dist/lilobj.min.js in you browser and call it like this:

```javascript
(function () {

  var model = require('lilmodel').model;

  var beer = model.extend({

    defaults: {
      sizeInLiters: 0.5,
    },

    rules: {
      type: ['required', 'string']
      sizeInLiters: ['required', 'number', ['gte', 0.2]]
    }

  });

  var dunkel = beer.create({
    type: 'lager',
  });

  dunkel.save(function (err) {
    //callback from sync 
  });

}());
```

## Node usage

install the module with: `npm install lilmodel`

```javascript
var beer = model.extend({

  defaults: {
    sizeInLiters: 0.5,
  },

  rules: {
    type: ['required', 'string']
    sizeInLiters: ['required', 'number', ['gte', 0.2]]
  }

});

var dunkel = beer.create({
  type: 'lager',
});

dunkel.save(function (err) {
  //callback from sync 
});
```

## Documentation

### syncr(sync)

__sync(method, obj, callback)__

__methods__

* 'create'
* 'update'
* 'fetch'
* 'destroy'
* 'find'

### model.extend(config)

__config__

* defaults
* rules
* children

### model.create(properties)

### _modelInstance_.validate()

### _modelInstance_.save(callback)

### _modelInstance_.fetch(callback)

### _modelInstance_.destroy(callback)

## License
Copyright (c) 2012 August Hovland
Licensed under the MIT license.
