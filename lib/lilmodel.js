/*jshint curly:true, eqeqeq:true, immed:true, latedef:true,
  newcap:true, noarg:true, sub:true, undef:true, boss:true,
  strict:false, eqnull:true, browser:true, node:true */

var syncr = require('./syncr');
var model = require('./model');
var collection = require('./collection');

module.exports = {
  syncr: syncr,
  model: model,
  collection: collection
};
