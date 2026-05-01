const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['student', 'teacher', 'admin'],
        default: 'student',
    },
        // Human-readable class name (e.g. "Class 10") — kept for display in dashboard
    className: { type: String, default: null },
    studentCode:      { type: String, unique: true, sparse: true },  // sparse skips absent fields (not null!)
    teacherClassCode: { type: String, default: null },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
