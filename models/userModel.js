var mongoose = require('mongoose');
var connection = require('../lib/database');

var userSchema = mongoose.Schema({
  token: String,
  fname: {
    type: String,
    required: true,
    trim: true
  },
  lname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  usertype: String,
});

module.exports = mongoose.model('user', userSchema);