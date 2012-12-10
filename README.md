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

### syncr(syncMethod)

### model.extend(config)

### model.create(properties)

### _model_.validate()

### _model_.save(callback, context)

### _model_.fetch(callback, context)

### _model_.destroy(callback, context)

### collection.extend(config)

### collection.create(propertiesList)

### _collection_.validate()

### _collection_.add(properties)

### _collection_.remove(query)

### _collection_.get(query)

### _collection_.find(query, callback, context)

## License
Copyright (c) 2012 August Hovland
Licensed under the MIT license.
