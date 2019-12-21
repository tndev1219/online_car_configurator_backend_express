var mongoose = require('mongoose');
var connection = require('../lib/database');

var vehiclesSchema = mongoose.Schema({
   type: {
      type: String,
      required: true,
      trim: true
   },
   brand: {
      type: String,
      required: true,
      trim: true
   },
   option_arr: {
      type: Array
   },
   model: {
      type: String,
      required: true,
      trim: true
   },
   image: {
      type: String,
      required: true,
      trim: true
   },
   lastUpdate: {
      type: String,
      required: true
   }
});

module.exports = mongoose.model('vehicles', vehiclesSchema);