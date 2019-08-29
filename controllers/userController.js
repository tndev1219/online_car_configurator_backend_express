'user strict';
require('dotenv').config();

var crypto = require('crypto');
var nodeMailer = require('nodemailer');

var constants = require('../conf/constants');
var User = require('../models/userModel');

exports.signup = function(req, res) {
  console.log('signup', req.body);
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
          message: 'Email Already Used',
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

exports.signin = function(req, res) {
  console.log('signin', req.body);
  User.findOne({email: req.body.email}).exec(function (err, user) {
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
      user.save(function (err) {
        if (err) {
          return res.json({
            success: false,
            message: 'Incorrect Login',
            code: constants.ErrorCode
          });  
        } else {
          req.session.user = user;
          return res.json ({
            success: true,
            message: 'Logged In Successfully',
            code: constants.SuccessCode,
            result: user
          });
        }        
      });
    }
  });
};

exports.logout = function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      return res.json({
        success: false,
        message: 'Unable to Destroy Session',
        code: constants.ErrorCode
      });  
    }
    return res.json ({
      success: true,
      message: 'Destroied Session Successfully',
      code: constants.SuccessCode,
      result: null
    });
  });
}

exports.forgotpassword = function (req, res) {
  console.log('forgotpassword', req.body);
  User.findOne({email: req.body.email}).exec(function (err, user) {
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
        host: 'mail.greenhousebenching.nl',
        port: 465,
        secure: true,
        auth: {
          user: 'info@greenhousebenching.nl',
          pass: '}2Nj]!,*)P3J'
        }
      });

      let mailOptions = {
        from: 'manager@onlinecarconfigurator.com',
        to: 'venusanderos@protonmail.com',
        subject: 'Forgotten Password Verification',
        text: 'Reset Password for %s',
        html: `<b>Please click this link to <a href="http://localhost:3005/reset-password/${user.token}">Reset Your Password</a></b>`
      }

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
        return res.json ({
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
  console.log('resetpassword', req.body);
  User.findOne({token: req.body.token}).exec(function (err, user) {
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
          return res.json ({
            success: true,
            message: 'Reseted Password Successfully',
            code: constants.SuccessCode,
            result: null
          });
        }        
      });
    }
  });
}