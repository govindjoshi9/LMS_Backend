const User   = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { generateStudentCode, generateTeacherClassCode } = require('../utils/generateCode');

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const buildResponse = (user) => ({
    _id:              user.id,
    username:         user.username,
    email:            user.email,
    role:             user.role,
    className:        user.className,
    studentCode:      user.studentCode  || null,
    teacherClassCode: user.teacherClassCode || null,
    token:            generateToken(user.id),
});

// ── POST /api/auth/register ────────────────────────────────────────────────
const registerUser = async (req, res) => {
    try {
        const { username, email, password, role, countryCode, schoolCode, classCode, className } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email and password are required' });
        }

        if (await User.findOne({ email })) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Students & teachers must pick school context
        const needsSchool = role === 'student' || role === 'teacher';
        if (needsSchool && (!countryCode || !schoolCode || !classCode)) {
            return res.status(400).json({ message: 'Country, school and class are required' });
        }

        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

        const userData = {
            username,
            email,
            password: hashedPassword,
            role: role || 'student',
            className: className || null,
        };

        if (role === 'student') {
            userData.studentCode = await generateStudentCode(
                countryCode.toUpperCase(),
                schoolCode.toUpperCase(),
                classCode.toUpperCase()
            );
        } else if (role === 'teacher') {
            userData.teacherClassCode = generateTeacherClassCode(
                countryCode.toUpperCase(),
                schoolCode.toUpperCase(),
                classCode.toUpperCase()
            );
        }

        const user = await User.create(userData);
        res.status(201).json(buildResponse(user));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── POST /api/auth/login ───────────────────────────────────────────────────
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json(buildResponse(user));
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── POST /api/auth/forgot-password ────────────────────────────────────────
const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const resetToken = require('crypto').randomBytes(20).toString('hex');
        user.resetPasswordToken  = resetToken;
        user.resetPasswordExpire = Date.now() + 3_600_000;
        await user.save();

        res.status(200).json({ message: 'Reset token generated', resetToken });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── POST /api/auth/reset-password/:token ──────────────────────────────────
const resetPassword = async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken:  req.params.token,
            resetPasswordExpire: { $gt: Date.now() },
        });
        if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

        user.password            = await bcrypt.hash(req.body.password, await bcrypt.genSalt(10));
        user.resetPasswordToken  = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword };
