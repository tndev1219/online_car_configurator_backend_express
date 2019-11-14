var mongoose = require('mongoose');
var connection = require('../lib/database');

var wheelsSchema = mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	brand: {
		type: String,
		required: true,
		trim: true
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

module.exports = mongoose.model('wheels', wheelsSchema);