'user strict';
require('dotenv').config();

var crypto = require('crypto');
var nodeMailer = require('nodemailer');

var constants = require('../conf/constants');
var User = require('../models/userModel');
var Vehicle = require('../models/vehiclesModel');
var Wheel = require('../models/wheelsModel');

exports.authCheck = function(req, res, next) {
   next();
};

exports.signup = function (req, res) {

   var user = new User();
   user.fname = req.body.fname;
   user.lname = req.body.lname;
   user.email = req.body.email;
   user.password = crypto.createHash('md5').update(req.body.password).digest('hex');
   user.usertype = '1';
   user.token = '';
   user.save(function (err) {
      if (err) {
         if (err.code === 11000) {
            res.json({
               success: false,
               message: 'Email Already Exist!',
               code: constants.ExistError
            });
         }
         res.json({
            success: false,
            message: 'Unable to Create Account. Please Try Again Later...',
            code: constants.ErrorCode
         });
      } else {
         res.json({
            success: true,
            message: 'Account Successfully Created',
            code: constants.SuccessCode,
            result: user
         });
      }
   });
};

exports.signin = function (req, res) {

   User.findOne({
      email: req.body.email
   }).exec(function (err, user) {
      if (err) {
         res.json({
            success: false,
            message: 'Incorrect Login',
            code: constants.ErrorCode
         });
      }
      if (!user || user.password != crypto.createHash('md5').update(req.body.password).digest('hex')) {
         res.json({
            success: false,
            message: 'Email or Password is Incorrect!',
            code: constants.AuthError,
         });
      } else {
         user.token = crypto.createHash('sha512').update(String((new Date()).getTime())).digest('hex');
         req.session.user = user;

         res.json({
            success: true,
            message: 'Logged In Successfully',
            code: constants.SuccessCode,
            result: user
         });
      }
   });
};

exports.forgotpassword = function (req, res) {

   User.findOne({
      email: req.body.email
   }).exec(function (err, user) {
      if (err) {
         res.json({
            success: false,
            message: 'Unable to Reset Password. Please Try Again Later...',
            code: constants.ErrorCode
         });
      }
      if (!user) {
         res.json({
            success: false,
            message: 'Email Does Not Exist!',
            code: constants.NoExistError,
         });
      } else {
         let transporter = nodeMailer.createTransport({
            host: '',
            port: 465,
            secure: true,
            auth: {
               user: '',
               pass: ''
            }
         });

         let mailOptions = {
            from: 'manager@onlinecarconfigurator.com',
            to: 'venusanderos@protonmail.com',
            subject: 'Forgotten Password Verification',
            text: 'Reset Password for %s',
            html: `<b>Please click this link to <a href="http://localhost:3005/reset-password/${user.token}">Reset Your Password</a></b>`
         };

         transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
               console.log('forgotpassword sendEmail', err);
               res.json({
                  success: false,
                  message: 'Unable to Forgotten Password Verification. Please try again later...',
                  code: constants.ErrorCode
               });
            }
            console.log('Forgotten Password Verification Message %s sent: %s', info.messageId, info.response);
            res.json({
               success: true,
               message: 'Just Forgotten Password Verification Email Sent. Please check your inbox or spam',
               code: constants.SuccessCode,
               result: null
            });
         });
      }
   });
};

exports.resetpassword = function (req, res) {

   User.findOne({
      token: req.body.token
   }).exec(function (err, user) {
      if (err) {
         res.json({
            success: false,
            message: 'Unable to Reset Password. Please Try Again Later...',
            code: constants.ErrorCode
         });
      }
      if (!user) {
         res.json({
            success: false,
            message: 'Unable to Reset Password. Please Resend Reset Password Request Email...',
            code: constants.NoExistError,
         });
      } else {
         user.password = crypto.createHash('md5').update(req.body.password).digest('hex');

         user.save(function (err) {
            if (err) {
               res.json({
                  success: false,
                  message: 'Unable to Reset Password. Please Try Again Later...',
                  code: constants.ErrorCode
               });
            } else {
               res.json({
                  success: true,
                  message: 'Reseted Password Successfully',
                  code: constants.SuccessCode,
                  result: null
               });
            }
         });
      }
   });
};

exports.getVehicles = function(req, res) {

   Vehicle.find().sort({brand: 1, type: 1}).exec(function(err, vehicles) {
      if (err) {
         res.json({
            success: false,
            message: 'Failed to Get Vehicles Data. Please Try Again Later...',
            code: constants.ErrorCode
         });
      } else {
         var vehiclesData = vehicles.map(vehicle => ({
               brand: vehicle.brand,
               vehicleType: vehicle.type,
               modelPath: vehicle.model,
               imagePath: vehicle.image
            })
         );

         res.json({
            success: true,
            message: 'Successfully Get Vehicles Data!',
            code: constants.SuccessCode,
            result: vehiclesData
         });
      }
   });
};

exports.getPartials = function(req, res) {

   Wheel.find().sort({brand: 1, name: 1}).exec(function(err, wheels) {
      if (err) {
         res.json({
            success: false,
            message: 'Failed to Get Wheels Data. Please Try Again Later...',
            code: constants.ErrorCode
         });
      } else {
         var wheelsData = [];
         var wheelData = {};
         wheelData.paths = [];

         for (var i = 0; i < wheels.length; i++) {
            var wheel = wheels[i];

            wheelData.id = wheelsData.length;
            wheelData.label = wheel.brand;
            
            wheelData.paths.push({
               modelType: 'wheel',
               imagePath: wheel.image,
               modelPath: wheel.model,
               modelName: wheel.name
            });

            if (i === wheels.length-1 || wheels[i+1] && wheel.brand !== wheels[i+1].brand) {
               wheelsData.push(wheelData);
               wheelData = {};
               wheelData.paths = [];
            }
         }

         res.json({
            success: true,
            message: 'Successfully Get Partials Data!',
            code: constants.SuccessCode,
            result: {wheelsData}
         });
      }
   });
};