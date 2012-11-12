/*jshint curly:true, eqeqeq:true, immed:true, latedef:true,
  newcap:true, noarg:true, sub:true, undef:true, boss:true,
  strict:false, eqnull:true, browser:true, node:true */
/*global assert, refute */

var buster = typeof buster !== 'undefined' ? buster : require("buster");
var lilModel = typeof module !== 'undefined' ? require('../lib/lilmodel') : require('lilmodel');

buster.testCase("lilmodel", {

  "setUp": function () {
    this.syncStub = this.stub().callsArg(2);
    lilModel.syncr(this.syncStub);
  },

  "should call sync on save when valid": function () {

    var nextSpy = this.spy();

    var Recipe = lilModel.model.extend({

      defaults: {
        urlRoot: '/recipe'
      },

      rules: {
        urlRoot: ['required', 'string'],
        name: ['required', 'string']
      }
      
    });

    var Recipes = lilModel.collection.extend({
      model: Recipe
    });

    var Chef = lilModel.model.extend({

      defaults: {
        urlRoot: '/chef'
      },

      rules: {
        urlRoot: ['required', 'string'],
        name: ['required', 'string'],
        recipes: ['array'],
        sousChef: ['object']
      },

      children: {
        recipes: Recipes,
        sousChef: {}
      }

    });

    var chef = Chef.create({
      name: 'gus',
      sousChef: {
        name: 'zoe'
      },
      recipes: [
        { name: 'tacos' },
        { name: 'meatball sauce' }
      ]
    });

    chef.save(nextSpy);
    assert.calledOnce(this.syncStub);
    assert.calledOnce(nextSpy);
    assert.equals(chef.name, 'gus');
    assert.equals(chef.sousChef.name, 'zoe');
    assert.equals(chef.recipes.$[0].name, 'tacos');

  }

});

//var vlad = require('vladiator');

// var Chef = LilModel.extend({

//   defaults: {
//     urlRoot: '/chef'
//   },

//   validate: vlad({
//     _id: ['string'],
//     name: ['required', 'string', ['length', 0, 30]],
//     age: ['number', ['gte' , 1]],
//     assistant: ['chef'],
//     recipes: ['array']
//   }),

//   assistant: function () {
//     return Chef.create(this.$.assistant);
//   }

// });


// module.exports = Chef;


// var chefGus = Chef.create({
//   name: 'gus',
//   age: 40
// });

// chefGus.save(function (err, gus) {

// });


// Chef.create({ _id: 'dsfa32234' }).fetch(function (err, zoe) {

// });