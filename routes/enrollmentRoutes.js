const express = require('express');
const router = express.Router();
const { enrollUser, getUserEnrollments, updateProgress } = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, enrollUser).get(protect, getUserEnrollments);
router.route('/:id/progress').put(protect, updateProgress);

module.exports = router;
