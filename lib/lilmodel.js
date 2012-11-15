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
