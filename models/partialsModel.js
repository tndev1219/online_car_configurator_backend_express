var mongoose = require('mongoose');
var connection = require('../lib/database');

var partialsSchema = mongoose.Schema({
   modelType: {
      type: String,
      required: true,
      trim: true
   },
   modelPath: {
      type: String,
      required: true,
      trim: true
   },
   imagePath: {
      type: String,
      required: true,
      trim: true
   },
   modelName: {
      type: String,
      required: true,
      trim: true
   },
   modelMinSize: {
      type: Number
   }
});

module.exports = mongoose.model('partials', partialsSchema);