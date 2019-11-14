var express = require('express');
var router = express.Router();

var adminController = require('../controllers/adminController');

router.post('/signup', adminController.signup);
router.post('/signin', adminController.signin);
router.post('/autoSignInWithToken', adminController.autoSignInWithToken);
router.post('/uploadImage', adminController.uploadImage);
router.post('/uploadModel', adminController.uploadModel);
router.get('/getVehicles', adminController.authCheck, adminController.getVehicles);
router.post('/addVehicle', adminController.authCheck, adminController.addVehicle);
router.post('/updateVehicle', adminController.authCheck, adminController.updateVehicle);
router.post('/removeVehicle', adminController.authCheck, adminController.removeVehicle);
router.post('/removeVehicles', adminController.authCheck, adminController.removeVehicles);
router.get('/getWheels', adminController.authCheck, adminController.getWheels);
router.post('/addWheel', adminController.authCheck, adminController.addWheel);
router.post('/updateWheel', adminController.authCheck, adminController.updateWheel);
router.post('/removeWheel', adminController.authCheck, adminController.removeWheel);
router.post('/removeWheels', adminController.authCheck, adminController.removeWheels);

module.exports = router;