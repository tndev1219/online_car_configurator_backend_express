var express = require('express');
var router = express.Router();

var adminController = require('../controllers/adminController');

// auth
router.post('/signup', adminController.signup);
router.post('/signin', adminController.signin);
router.post('/autoSignInWithToken', adminController.autoSignInWithToken);

// upload model data
router.post('/uploadImage', adminController.uploadImage);
router.post('/uploadModel', adminController.uploadModel);

// vehicles data crud
router.post('/getVehicles', adminController.authCheck, adminController.getVehicles);
router.post('/addVehicle', adminController.authCheck, adminController.addVehicle);
router.post('/updateVehicle', adminController.authCheck, adminController.updateVehicle);
router.post('/removeVehicle', adminController.authCheck, adminController.removeVehicle);
router.post('/removeVehicles', adminController.authCheck, adminController.removeVehicles);

// wheels data crud
router.post('/getWheels', adminController.authCheck, adminController.getWheels);
router.post('/addWheel', adminController.authCheck, adminController.addWheel);
router.post('/updateWheel', adminController.authCheck, adminController.updateWheel);
router.post('/removeWheel', adminController.authCheck, adminController.removeWheel);
router.post('/removeWheels', adminController.authCheck, adminController.removeWheels);

// partials data crud
router.post('/getPartials', adminController.authCheck, adminController.getPartials);
router.post('/getVehicleTypes', adminController.authCheck, adminController.getVehicleTypes);
router.post('/addPartial', adminController.authCheck, adminController.addPartial);
router.post('/updatePartial', adminController.authCheck, adminController.updatePartial);
router.post('/removePartial', adminController.authCheck, adminController.removePartial);
router.post('/removePartials', adminController.authCheck, adminController.removePartials);

module.exports = router;