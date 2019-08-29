var express = require('express');
var router = express.Router();

var userController = require('../controllers/userController');

router.post('/signup', userController.signup);
router.post('/signin', userController.signin);
router.post('/logout', userController.logout);
router.post('/forgotpassword', userController.forgotpassword);
router.post('/resetpassword', userController.resetpassword);

module.exports = router;
