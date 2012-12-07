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

    chef.recipes.add({ name: 'eggs' });
    var results = chef.recipes.get({ name: 'tacos' });
    chef.recipes.remove({ name: 'meatball sauce' });


    var context = { me: 'gus' };
    chef.save(nextSpy, context);
    assert.calledOnce(this.syncStub);
    assert.calledOnce(nextSpy);
    assert(nextSpy.calledOn(context));
    assert.equals(chef.name, 'gus');
    assert.equals(chef.sousChef.name, 'zoe');
    assert.equals(chef.recipes.$[0].name, 'tacos');
    assert.equals(chef.recipes.$[1].name, 'eggs');
    assert.equals(chef.recipes.$.length, 2);
    assert.equals(results.length, 1);
    assert.equals(results[0], chef.recipes.$[0]);

  }

});
