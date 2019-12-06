var express = require('express');
var router = express.Router();

var userController = require('../controllers/userController');

router.post('/signup', userController.signup);
router.post('/signin', userController.signin);
router.post('/forgotpassword', userController.forgotpassword);
router.post('/resetpassword', userController.resetpassword);
router.post('/getVehicles', userController.authCheck, userController.getVehicles);
router.post('/getBrands', userController.authCheck, userController.getBrands);
router.post('/getPartials', userController.authCheck, userController.getPartials);

module.exports = router;