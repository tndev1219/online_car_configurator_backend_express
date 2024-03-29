'user strict';
require('dotenv').config();

var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
var moment = require('moment');

var constants = require('../conf/constants');
var Admin = require('../models/userModel');
var Vehicle = require('../models/vehiclesModel');
var Wheel = require('../models/wheelsModel');
var Partial = require('../models/partialsModel');
var Logo = require('../models/logosModel');

const jwtConfig = {
   "secret"   : "online_car_configurator_admin_sacret_key",
   "expiresIn": "1d" // A numeric value is interpreted as a seconds count. If you use a string be sure you provide the time units (days, hours, etc)
};

// User Authontication
exports.authCheck = function(req, res, next) {

   if (req.headers.authorization) {
      const access_token = req.headers.authorization.split(' ')[1];
      
      jwt.verify(access_token, jwtConfig.secret, function(err, data) {
         if (err) {
            if (err.message === 'jwt expired') {
               return res.json({
                  success: false,
                  message: 'Access token expired!',
                  code: constants.TokenError
               });
            } else {
               return res.json({
                  success: false,
                  message: 'Invalid token!',
                  code: constants.TokenError
               });
            }
         } else {
            next();
         }
      });
   } else {
      return res.json({
         success: false,
         message: 'Invalid token!',
         code: constants.TokenError
      });
   }
};

exports.signup = function (req, res) {

   var admin = new Admin();
   admin.fname = 'admin';
   admin.lname = 'admin';
   admin.email = 'admin@mail.com';
   admin.password = crypto.createHash('md5').update('admin').digest('hex');
   admin.usertype = '2';
   admin.token = '';
   admin.save(function (err) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });
      } else {
         return res.json({
            success: true,
            message: 'New admin created!',
            code: constants.SuccessCode,
            result: admin
         });
      }
   });
};

exports.signin = function (req, res) {

   Admin.findOne({
      fname: req.body.username,
      usertype: 2
   }).exec(function (err, admin) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });
      }
      if (!admin || admin.password != crypto.createHash('md5').update(req.body.password).digest('hex')) {
         return res.json({
            success: false,
            message: 'Authentication failed!',
            code: constants.AuthError
         });
      } else {
         admin.token = jwt.sign({id: admin._id}, jwtConfig.secret, {expiresIn: jwtConfig.expiresIn});
         
         return res.json({
            success: true,
            message: 'Login Success!',
            code: constants.SuccessCode,
            result: admin.token
         });
      }
   });
};

exports.autoSignInWithToken = function(req, res) {

   var access_token = req.body.access_token;

   jwt.verify(access_token, jwtConfig.secret, function(err, data) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.AuthError
         });
      } else {
         Admin.findOne({ _id: data.id }).exec(function (err, admin) {
            if (err) {
               return res.json({
                  success: false,
                  message: err.message,
                  code: constants.ErrorCode
               });
            } else {
               admin.token = jwt.sign({id: admin._id}, jwtConfig.secret, {expiresIn: jwtConfig.expiresIn});
               
               return res.json({
                  success: true,
                  message: 'AutoLogin Success!',
                  code: constants.SuccessCode,
                  result: admin.token
               });
            }            
         });
      }
   });
};

// Upload the models and images of Vehicle or Partial
exports.uploadImage = function(req, res) {

   const form = new formidable.IncomingForm();

   form.parse(req, function(err, fields, files) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });
      }
      
      var oldPath = files.file.path;
      var absolutepath = path.join(__dirname, '../public/images/');
      var fileName = `${(new Date()).getTime()}.${fields.fileName.split('.')[fields.fileName.split('.').length-1]}`;
      
      fs.readFile(oldPath, function(err, data) {
         if (err) {
            return res.json({
               success: false,
               message: err.message,
               code: constants.ErrorCode
            });
         }
         
         fs.writeFile(`${absolutepath}${fileName}`, data, function(err) {
            if (err) {
               return res.json({
                  success: false,
                  message: err.message,
                  code: constants.ErrorCode
               });
            }
            
            fs.unlink(oldPath, function(err) {});
            
            return res.json({
               success: true,
               message: 'Upload Image Success!',
               code: constants.SuccessCode,
               result: `/images/${fileName}`
            });
         });
      });
   });
};

exports.uploadModel = function(req, res) {

   const form = new formidable.IncomingForm();

   form.parse(req, function(err, fields, files) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });
      }

      var oldPath = files.file.path;
      var absolutepath = path.join(__dirname, '../public/models/');
      var fileName = `${(new Date()).getTime()}.${fields.fileName.split('.')[fields.fileName.split('.').length-1]}`;
      
      fs.readFile(oldPath, function(err, data) {
         if (err) {
            return res.json({
               success: false,
               message: err.message,
               code: constants.ErrorCode
            });
         }
         
         fs.writeFile(`${absolutepath}${fileName}`, data, function(err) {
            if (err) {
               return res.json({
                  success: false,
                  message: err.message,
                  code: constants.ErrorCode
               });
            }
            
            fs.unlink(oldPath, function(err) {});
            
            return res.json({
               success: true,
               message: 'Upload Model Success!',
               code: constants.SuccessCode,
               result: `/models/${fileName}`
            });
         });
      });
   });
};

// Vehicles Data CRUD
exports.getVehicles = function(req, res) {
   
   Vehicle.find().sort({brand: 1, type: 1}).exec(function(err, vehicles) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });
      } else {
         return res.json({
            success: true,
            message: 'Get Vehicles Data Success!',
            code: constants.SuccessCode,
            result: vehicles
         });
      }
   });
};

exports.addVehicle = function(req, res) {

   var vehicle = new Vehicle();
   
   vehicle.brand = req.body.newVehicle.brand;
   vehicle.type = req.body.newVehicle.type;
   vehicle.option_arr = req.body.newVehicle.option_arr;
   vehicle.image = req.body.newVehicle.image;
   vehicle.model = req.body.newVehicle.model;
   vehicle.lastUpdate = moment(new Date()).format('MMMM Do YYYY, hh:mm:ss a');
   
   vehicle.save(function (err) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });
      } else {
         return res.json({
            success: true,
            message: 'New Vehicle Added!',
            code: constants.SuccessCode,
            result: vehicle
         });
      }
   });
};

exports.updateVehicle = function(req, res) {
   
   Vehicle.findOneAndUpdate({_id: req.body.vehicle._id}, req.body.vehicle).exec(function(err, originVehicle) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });   
      } else {
         Partial.updateMany({vehicle_type: originVehicle.type}, {vehicle_type: req.body.vehicle.type}).exec(function(err, result) {});

         return res.json({
            success: true,
            message: 'Update Vehicle Data Success!',
            code: constants.SuccessCode
         });
      }
   });
};

exports.removeVehicle = function(req, res) {

   Vehicle.findOneAndDelete({_id: req.body.vehicleId}).exec(function(err, vehicle) {

      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });   
      } else {
         Partial.deleteMany({vehicle_type: vehicle.type}).exec(function(err, vehicle) {});
         
         return res.json({
            success: true,
            message: 'Delete Vehicle Data Success!',
            code: constants.SuccessCode
         });
      }
   });
};

exports.removeVehicles = function(req, res) {

   Vehicle.find({_id: req.body.vehicleIds}).exec(function(err, vehicles) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });   
      } else {
         var vehicleTypes = [];
         for (var i = 0; i < vehicles.length; i++) {
            if (!vehicleTypes.includes(vehicles[i].type)) {
               vehicleTypes.push(vehicles[i].type);
            }
         }

         Partial.deleteMany({vehicle_type: vehicleTypes}).exec(function(err, result) {});

         Vehicle.deleteMany({_id: req.body.vehicleIds}).exec(function(err, result) {
            if (err) {
               return res.json({
                  success: false,
                  message: err.message,
                  code: constants.ErrorCode
               });   
            } else {
               return res.json({
                  success: true,
                  message: 'Delete Vehicles Data Success!',
                  code: constants.SuccessCode
               });
            }
         });
      }
   });
};

// Wheels Data CRUD
exports.getWheels = function(req, res) {
   
   Wheel.find().sort({brand: 1, name: 1}).exec(function(err, wheels) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });
      } else {
         return res.json({
            success: true,
            message: 'Get Wheels Data Success!',
            code: constants.SuccessCode,
            result: wheels
         });
      }
   });
};

exports.addWheel = function(req, res) {

   var wheel = new Wheel();
   
   wheel.brand = req.body.newWheel.brand;
   wheel.name = req.body.newWheel.name;
   wheel.image = req.body.newWheel.image;
   wheel.model = req.body.newWheel.model;
   wheel.lastUpdate = moment(new Date()).format('MMMM Do YYYY, hh:mm:ss a');
   
   wheel.save(function (err) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });
      } else {
         return res.json({
            success: true,
            message: 'New Wheel Added!',
            code: constants.SuccessCode,
            result: wheel
         });
      }
   });
};

exports.updateWheel = function(req, res) {
   
   Wheel.findOneAndUpdate({_id: req.body.wheel._id}, req.body.wheel).exec(function(err) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });   
      } else {
         return res.json({
            success: true,
            message: 'Update Wheel Data Success!',
            code: constants.SuccessCode
         });
      }
   });
};

exports.removeWheel = function(req, res) {
   
   Wheel.findOneAndDelete({_id: req.body.wheelId}).exec(function(err, wheel) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });   
      } else {
         return res.json({
            success: true,
            message: 'Delete Wheel Data Success!',
            code: constants.SuccessCode
         });
      }
   });
};

exports.removeWheels = function(req, res) {
   
   Wheel.deleteMany({_id: req.body.wheelIds}).exec(function(err, wheel) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });   
      } else {
         return res.json({
            success: true,
            message: 'Delete Wheels Data Success!',
            code: constants.SuccessCode
         });
      }
   });
};

// Partials Data CRUD
exports.getPartials = function(req, res) {
   
   Partial.find({type: req.body.type}).sort({name: 1}).exec(function(err, partials) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });
      } else {
         return res.json({
            success: true,
            message: `Get ${req.body.type}s Data Success!`,
            code: constants.SuccessCode,
            result: partials
         });
      }
   });
};

exports.getVehicleTypes = function(req, res) {

   Vehicle.find().sort({type: 1}).exec(function(err, result) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });
      } else {
         var vehicleTypes = [];

         if (result.length !== 0) {
            for (var i = 0; i < result.length; i++) {
               if (!vehicleTypes.includes(result[i].type)) {
                  vehicleTypes.push(result[i].type);
               }
            }
         }

         return res.json({
            success: true,
            message: `Get Vehicle Types Data Success!`,
            code: constants.SuccessCode,
            result: vehicleTypes
         });
      }
   });
};

exports.addPartial = function(req, res) {

   var partial = new Partial();
   
   partial.type = req.body.newPartial.type;
   partial.name = req.body.newPartial.name;
   partial.vehicle_type = req.body.newPartial.vehicle_type;
   partial.image = req.body.newPartial.image;
   partial.model = req.body.newPartial.model;
   partial.lastUpdate = moment(new Date()).format('MMMM Do YYYY, hh:mm:ss a');

   if (req.body.newPartial.min_size) {
      partial.min_size = req.body.newPartial.min_size;
   }

   if (req.body.newPartial.size_arr) {
      partial.size_arr = req.body.newPartial.size_arr;
   }
   
   partial.save(function (err) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });
      } else {
         return res.json({
            success: true,
            message: `New ${partial.type} Added!`,
            code: constants.SuccessCode,
            result: partial
         });
      }
   });
};

exports.updatePartial = function(req, res) {
   
   Partial.findOneAndUpdate({_id: req.body.partial._id}, req.body.partial).exec(function(err) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });   
      } else {
         return res.json({
            success: true,
            message: `Update ${req.body.partial.type} Data Success!`,
            code: constants.SuccessCode
         });
      }
   });
};

exports.removePartial = function(req, res) {
   
   Partial.findOneAndDelete({_id: req.body.partialId}).exec(function(err, partial) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });   
      } else {
         return res.json({
            success: true,
            message: `Delete Partials Data Success!`,
            code: constants.SuccessCode
         });
      }
   });
};

exports.removePartials = function(req, res) {
   
   Partial.deleteMany({_id: req.body.partialIds}).exec(function(err) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });   
      } else {
         return res.json({
            success: true,
            message: `Delete Partials Data Success!`,
            code: constants.SuccessCode
         });
      }
   });
};

// Logos Data CRUD
exports.getLogos = function(req, res) {
   
   Logo.find().sort({name: 1}).exec(function(err, logos) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });
      } else {
         return res.json({
            success: true,
            message: `Get Logos Data Success!`,
            code: constants.SuccessCode,
            result: logos
         });
      }
   });
};

exports.addLogo = function(req, res) {

   var logo = new Logo();
   
   logo.name = req.body.newLogo.name;
   logo.image = req.body.newLogo.image;
   logo.active = req.body.newLogo.active;
   logo.lastUpdate = moment(new Date()).format('MMMM Do YYYY, hh:mm:ss a');

   logo.save(function (err) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });
      } else {
         return res.json({
            success: true,
            message: `New Logo Added!`,
            code: constants.SuccessCode,
            result: logo
         });
      }
   });
};

exports.updateLogo = function(req, res) {
   
   Logo.findOneAndUpdate({_id: req.body.logo._id}, req.body.logo).exec(function(err) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });   
      } else {
         return res.json({
            success: true,
            message: `Update Logo Data Success!`,
            code: constants.SuccessCode
         });
      }
   });
};

exports.setLogo = function(req, res) {
   if (req.body.logo.active) {
      Logo.findByIdAndUpdate(req.body.logo._id, {active: true}).exec(function(err) {
         if (err) {
            return res.json({
               success: false,
               message: err.message,
               code: constants.ErrorCode
            });   
         } else {
            Logo.findOneAndUpdate({_id: { $ne: req.body.logo._id } , active: true}, {active: false}).exec(function(err) {
               if (err) {
                  return res.json({
                     success: false,
                     message: err.message,
                     code: constants.ErrorCode
                  });
               } else {
                  return res.json({
                     success: true,
                     message: `Set Logo Success!`,
                     code: constants.SuccessCode
                  });      
               }
            });
         }
      });
   } else {
      Logo.findByIdAndUpdate(req.body.logo._id, {active: false}).exec(function(err) {
         if (err) {
            return res.json({
               success: false,
               message: err.message,
               code: constants.ErrorCode
            });   
         } else {
            return res.json({
               success: true,
               message: `Set Logo Success!`,
               code: constants.SuccessCode
            });
         }
      });
   }
};

exports.removeLogo = function(req, res) {
   
   Logo.findOneAndDelete({_id: req.body.logoId}).exec(function(err, logo) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });   
      } else {
         return res.json({
            success: true,
            message: `Delete Logo Data Success!`,
            code: constants.SuccessCode
         });
      }
   });
};

exports.removeLogos = function(req, res) {
   
   Logo.deleteMany({_id: req.body.logoIds}).exec(function(err) {
      if (err) {
         return res.json({
            success: false,
            message: err.message,
            code: constants.ErrorCode
         });   
      } else {
         return res.json({
            success: true,
            message: `Delete Logos Data Success!`,
            code: constants.SuccessCode
         });
      }
   });
};
