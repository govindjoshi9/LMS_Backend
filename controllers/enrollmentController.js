const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');


const enrollUser = async (req, res) => {
    try {
        const { courseId } = req.body;

        if (!courseId) {
            return res.status(400).json({ message: 'Course ID is required' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const existingEnrollment = await Enrollment.findOne({
            user: req.user._id,
            course: courseId
        });

        if (existingEnrollment) {
            return res.status(400).json({ message: 'You are already enrolled in this course' });
        }

        const enrollment = await Enrollment.create({
            user: req.user._id,
            course: courseId
        });

        res.status(201).json(enrollment);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You are already enrolled in this course' });
        }
        res.status(500).json({ message: error.message });
    }
};


const getUserEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ user: req.user._id }).populate('course');
        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateProgress = async (req, res) => {
    try {
        const { progress } = req.body;
        
        if (progress === undefined || progress < 0 || progress > 100) {
            return res.status(400).json({ message: 'Valid progress percentage (0-100) is required' });
        }

        const enrollment = await Enrollment.findById(req.params.id);

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        if (enrollment.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized for this enrollment' });
        }

        enrollment.progress = progress;
        const updatedEnrollment = await enrollment.save();

        res.json(updatedEnrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    enrollUser,
    getUserEnrollments,
    updateProgress
};
