var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var cors = require('cors');

var apisRouter = require('./routes/apis');
var adminRouter = require('./routes/admin');

var app = express();

app.use(logger('dev'));
app.use(cookieParser());
app.use(session({
   secret: 'online_car_configurator',
   resave: false,
   saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({
   extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/admin', adminRouter);
app.use('/apis', apisRouter);

module.exports = app;