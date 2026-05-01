const User = require('../models/User');

const generateStudentCode = async (countryCode, schoolCode, classCode) => {
    const count = await User.countDocuments({
        role: 'student',
        studentCode: { $regex: `^${countryCode}${schoolCode}${classCode}` },
    });

    const paddedId = String(count + 1).padStart(6, '0');
    return `${countryCode}${schoolCode}${classCode}${paddedId}`;
};

const decodeStudentCode = (code) => {
    if (!code || code.length < 15) return null;
    return {
        countryCode: code.slice(0, 2),
        schoolCode:  code.slice(2, 6),
        classCode:   code.slice(6, 9),
        studentId:   code.slice(9),
    };
};


const generateTeacherClassCode = (countryCode, schoolCode, classCode) => {
    return `${countryCode}${schoolCode}${classCode}`;
};

module.exports = { generateStudentCode, decodeStudentCode, generateTeacherClassCode };
