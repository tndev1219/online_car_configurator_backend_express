'user strict';
require('dotenv').config();

var crypto     = require('crypto');
var nodeMailer = require('nodemailer');

var constants  = require('../conf/constants');
var User       = require('../models/userModel');
var Vehicle    = require('../models/vehiclesModel');
var Wheel      = require('../models/wheelsModel');
var Partial    = require('../models/partialsModel');

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
            return res.json({
               success: false,
               message: 'Email Already Exist!',
               code: constants.ExistError
            });
         }
         return res.json({
            success: false,
            message: 'Unable to Create Account. Please Try Again Later...',
            code: constants.ErrorCode
         });
      } else {
         return res.json({
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
         return res.json({
            success: false,
            message: 'Incorrect Login',
            code: constants.ErrorCode
         });
      }
      if (!user || user.password != crypto.createHash('md5').update(req.body.password).digest('hex')) {
         return res.json({
            success: false,
            message: 'Email or Password is Incorrect!',
            code: constants.AuthError,
         });
      } else {
         user.token = crypto.createHash('sha512').update(String((new Date()).getTime())).digest('hex');
         req.session.user = user;

         return res.json({
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
         return res.json({
            success: false,
            message: 'Unable to Reset Password. Please Try Again Later...',
            code: constants.ErrorCode
         });
      }
      if (!user) {
         return res.json({
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
               return res.json({
                  success: false,
                  message: 'Unable to Forgotten Password Verification. Please try again later...',
                  code: constants.ErrorCode
               });
            }
            console.log('Forgotten Password Verification Message %s sent: %s', info.messageId, info.response);
            return res.json({
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
         return res.json({
            success: false,
            message: 'Unable to Reset Password. Please Try Again Later...',
            code: constants.ErrorCode
         });
      }
      if (!user) {
         return res.json({
            success: false,
            message: 'Unable to Reset Password. Please Resend Reset Password Request Email...',
            code: constants.NoExistError,
         });
      } else {
         user.password = crypto.createHash('md5').update(req.body.password).digest('hex');

         user.save(function (err) {
            if (err) {
               return res.json({
                  success: false,
                  message: 'Unable to Reset Password. Please Try Again Later...',
                  code: constants.ErrorCode
               });
            } else {
               return res.json({
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
         return res.json({
            success: false,
            message: 'Failed to Get Vehicles Data. Please Try Again Later...',
            code: constants.ErrorCode
         });
      } else {
         var vehiclesData = vehicles.map(vehicle => ({
               brand: vehicle.brand,
               vehicleType: vehicle.type,
               configOptions: vehicle.option_arr,
               modelPath: vehicle.model,
               imagePath: vehicle.image
            })
         );

         return res.json({
            success: true,
            message: 'Successfully Get Vehicles Data!',
            code: constants.SuccessCode,
            result: vehiclesData
         });
      }
   });
};

exports.getBrands = function(req, res) {
   Vehicle.find().sort({brand: 1}).exec(function(err, brands) {
      if (err) {
         return res.json({
            success: false,
            message: 'Failed to Get Registered Vehicles Brand Data. Please Try Again Later...',
            code: constants.ErrorCode
         });
      } else {
         var result = [];

         for(var i = 0; i < brands.length; i++) {
            if (!result.includes(brands[i].brand)) {
               result.push(brands[i].brand);
            }
         }

         return res.json({
            success: true,
            message: 'Successfully Get Registered Vehicles Brand Data!',
            code: constants.SuccessCode,
            result: result
         });
      }
   });
};

exports.getPartials = function(req, res) {
   
   Wheel.find().sort({brand: 1, name: 1}).exec(function(err, wheels) {
      if (err) {
         return res.json({
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

         Partial.find({vehicle_type: req.body.vehicle_type}).sort({type: 1, name: 1}).exec(function(err, partials) {
            if (err) {
               return res.json({
                  success: false,
                  message: 'Failed to Get Partials Data. Please Try Again Later...',
                  code: constants.ErrorCode
               });
            } else {
               var tiresData           = [],
                   suspensionsData     = [],
                   shockData           = [],
                   frontbumperData     = [],
                   rearbumperData      = [],
                   fenderData          = [],
                   grilleData          = [],
                   headlightData       = [],
                   hoodData            = [],
                   bedcoverData        = [],
                   bedaccessoryData    = [],
                   additionallightData = [],
                   hitchData           = [];                   
               var model = {};

               for (var i = 0; i < partials.length; i++) {

                  model.modelType    = partials[i].type;
                  model.imagePath    = partials[i].image;
                  model.modelPath    = partials[i].model;
                  model.modelName    = partials[i].name;
                  model.modelMinSize = partials[i].min_size;
                  model.modelSizeArr = partials[i].size_arr;

                  if (model.modelType === 'tire') {
                     tiresData.push(model);
                  } else if (model.modelType === 'suspension') {
                     suspensionsData.push(model);
                  } else if (model.modelType === 'shock') {
                     shockData.push(model);
                  } else if (model.modelType === 'frontbumper') {
                     frontbumperData.push(model);
                  } else if (model.modelType === 'rearbumper') {
                     rearbumperData.push(model);
                  } else if (model.modelType === 'fender') {
                     fenderData.push(model);
                  } else if (model.modelType === 'grille') {
                     grilleData.push(model);
                  } else if (model.modelType === 'headlight') {
                     headlightData.push(model);
                  } else if (model.modelType === 'hood') {
                     hoodData.push(model);
                  } else if (model.modelType === 'bedcover') {
                     bedcoverData.push(model);
                  } else if (model.modelType === 'bedaccessory') {
                     bedaccessoryData.push(model);
                  } else if (model.modelType === 'additionallight') {
                     additionallightData.push(model);
                  } else if (model.modelType === 'hitch') {
                     hitchData.push(model);
                  }
                  model = {};
               }
               
               return res.json({
                  success: true,
                  message: 'Successfully Get Partials Data!',
                  code: constants.SuccessCode,
                  result: {
                     wheelsData,
                     tiresData,
                     suspensionsData,
                     shockData,
                     frontbumperData,
                     rearbumperData,
                     fenderData,
                     grilleData,
                     headlightData,
                     hoodData,
                     bedcoverData,
                     bedaccessoryData,
                     additionallightData,
                     hitchData
                  }
               });
            }
         });
      }
   });
};