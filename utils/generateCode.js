const User = require('../models/User');

/**
 * Code layouts:
 *
 *  Student:         UKDW01A01000001   (15 chars)
 *  Teacher:         UKDW01A01         (9  chars)
 *                   ^^^^^^^^^^^^^^
 *                   0-1  country  (2)
 *                   2-5  school   (4)
 *                   6-8  class    (3)
 *                   9+   studentId (students only)
 *
 * Both codes share the same prefix layout, so decode is identical.
 */
const generateStudentCode = async (countryCode, schoolCode, classCode) => {
    const count = await User.countDocuments({
        role: 'student',
        studentCode: { $regex: `^${countryCode}${schoolCode}${classCode}` },
    });

    const paddedId = String(count + 1).padStart(6, '0');
    return `${countryCode}${schoolCode}${classCode}${paddedId}`;
};

/**
 * Teacher code: countryCode + schoolCode + classCode  → "UKDW01A01"
 * Same prefix layout as student code — makes decoding uniform.
 */
const generateTeacherClassCode = (countryCode, schoolCode, classCode) => {
    return `${countryCode}${schoolCode}${classCode}`;
};

/**
 * Decode school info from either a student or teacher code.
 * Both share the same prefix format, so slicing is identical.
 */
const decodeUserSchoolInfo = (user) => {
    const code = user.role === 'student' ? user.studentCode : user.teacherClassCode;

    if (!code || code.length < 9) return { schoolCode: null, classCode: null };

    return {
        schoolCode: code.slice(2, 6),   // chars 2-5  e.g. "DW01"
        classCode:  code.slice(6, 9),   // chars 6-8  e.g. "A01"
    };
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

module.exports = {
    generateStudentCode,
    generateTeacherClassCode,
    decodeUserSchoolInfo,
    decodeStudentCode,
};
