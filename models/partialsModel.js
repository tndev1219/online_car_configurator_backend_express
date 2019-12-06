var mongoose = require('mongoose');
var connection = require('../lib/database');

var partialsSchema = mongoose.Schema({
   type: {
      type: String,
      required: true,
      trim: true
   },
   name: {
      type: String,
      required: true,
      trim: true
   },
   vehicle_type: {
      type: String,
      required: true,
      trim: true
   },
   min_size: {
      type: Number,
      trim: true
   },
   size_arr: {
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

module.exports = mongoose.model('partials', partialsSchema);