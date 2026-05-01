const express = require('express');
const router  = express.Router();
const { getCountries, getSchoolsByCountry, getClasses } = require('../controllers/configController');

router.get('/countries', getCountries);
router.get('/schools',   getSchoolsByCountry);  // ?country=UK
router.get('/classes',   getClasses);

module.exports = router;
