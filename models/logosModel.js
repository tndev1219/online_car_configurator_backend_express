var mongoose = require('mongoose');
var connection = require('../lib/database');

var logosSchema = mongoose.Schema({
   name: {
      type: String,
      required: true,
      trim: true
   },
   image: {
      type: String,
      required: true,
      trim: true
   },
   active: {
      type: Boolean,
      required: true
   },
   lastUpdate: {
      type: String,
      required: true
   }
});

module.exports = mongoose.model('logos', logosSchema);