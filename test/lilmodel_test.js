var sinon = require('sinon');
var lilmodel = require('../lib/lilmodel');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['test model'] = {

  setUp: function(done) {

    this.sync = sinon.stub().callsArgWith(2, null, { _id: 'jojojo', baby: { _id: 'lomlom' }});
    this.syncCol = sinon.stub().callsArgWith(2, null, [{ _id: 'jojojo' }, { _id: 'momomo' }]);
    this.syncWithCol = sinon.stub().callsArgWith(2, null, { _id: 'lomlom', babies: [{ _id: 'jojojo' }, { _id: 'momomo' }] });
    this.saveCb = sinon.spy();
    this.subModel = sinon.spy();
    this.validateTrue = sinon.stub().returns({ isValid: true });
    done();

  },

  tearDown: function(done) {

    delete this.sync;
    delete this.syncCol;
    delete this.saveCb;
    delete this.subModel;
    delete this.validateTrue;
    done();

  },

  'create model': function(test) {

    var mongo = lilmodel.model({
      eats: 'mongobites',
      treats: 'nonnon'
    });

    var mgo = mongo.create();

    test.equal(mgo.eats, 'mongobites');
    test.equal(mgo.treats, 'nonnon');

    test.done();
  },

  'save model': function(test) {

    lilmodel.sync(this.sync);

    var baby = lilmodel.model({
      _id: undefined,
      name: 'mar',
      jr: 'slim',
      l1: this.subModel,
      tooth: 'mine'
    });

    var papa = lilmodel.model({
      _id: undefined,
      name: 'booty',
      ham: 'full',
      bone: 'none',
      baby: baby.create.bind(baby)
    });

    papa.validate = this.validateTrue;

    var instance = papa.create();

    instance.init({ bone: 'love' });
    instance.ham = 'half';
    instance.baby = { jr: 'zozo' };
    instance.baby.l1 = { pasta: 'yes' };
    instance.save(this.saveCb);

    test.ok(this.validateTrue.calledOnce);
    test.equal(this.sync.firstCall.args[0], 'create');
    test.equal(this.sync.firstCall.args[1].name, 'booty');
    test.equal(this.sync.firstCall.args[1].ham, 'half');
    test.equal(this.sync.firstCall.args[1].bone, 'love');
    test.equal(this.sync.firstCall.args[1].baby.name, 'mar');
    test.equal(this.sync.firstCall.args[1].baby.jr, 'zozo');
    test.equal(this.sync.firstCall.args[1].baby.tooth, 'mine');
    test.equal(this.saveCb.firstCall.args[1]._id, 'jojojo');
    test.equal(this.saveCb.firstCall.args[1].baby._id, 'lomlom');
    test.ok(typeof this.subModel === 'function');
    test.equal(this.subModel.callCount, 5);
    test.ok(this.subModel.calledWith({ pasta: 'yes' }));

    test.done();
  },

  'save with collection': function(test) {

    lilmodel.sync(this.syncWithCol);

    var baby = lilmodel.model({
      _id: undefined,
      name: 'zoe',
      jr: 'slim'
    });

    var papa = lilmodel.model({
      _id: undefined,
      name: 'booty',
      ham: 'full',
      babies: baby.collection.bind(baby)
    });

    var instance = papa.create();
    instance.init({ name: 'muji', babies: [{ name: 'juji' } , { name: 'fuji' }] });
    instance.save(this.saveCb);

    test.equal(this.syncWithCol.firstCall.args[1].name, 'muji');
    test.equal(this.syncWithCol.firstCall.args[1].ham, 'full');
    test.equal(this.syncWithCol.firstCall.args[1].babies[0].name, 'juji');
    test.equal(this.syncWithCol.firstCall.args[1].babies[0].jr, 'slim');
    test.equal(this.syncWithCol.firstCall.args[1].babies[1].name, 'fuji');
    test.equal(this.syncWithCol.firstCall.args[1].babies[1].jr, 'slim');
    test.equal(this.saveCb.firstCall.args[1]._id, 'lomlom');
    test.equal(this.saveCb.firstCall.args[1].babies[0]._id, 'jojojo');
    test.equal(this.saveCb.firstCall.args[1].babies[0].name, 'zoe');
    test.equal(this.saveCb.firstCall.args[1].babies[1]._id, 'momomo');
    test.equal(this.saveCb.firstCall.args[1].babies[1].name, 'zoe');

    test.done();
  },

  'find models': function(test) {

    lilmodel.sync(this.syncCol);

    var baby = lilmodel.model({
      _id: undefined,
      jr: 'slim'
    });

    var instance = baby.create();

    instance.init({ jr: 'lalala' });
    instance.find(this.saveCb);

    test.equal(this.syncCol.firstCall.args[0], 'find');
    test.equal(this.syncCol.firstCall.args[1].jr, 'lalala');
    test.equal(this.saveCb.firstCall.args[1][0]._id, 'jojojo');
    test.equal(this.saveCb.firstCall.args[1][1]._id, 'momomo');

    test.done();
  }

};
