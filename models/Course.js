const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    modulesCount: {
        type: Number,
        required: true,
        default: 1,
    },
    thumbnail: {
        type: String,
        default: 'https://via.placeholder.com/300x200?text=Course+Thumbnail',
    },
    instructor: {
        type: String,
        default: 'Admin',
    }
}, {
    timestamps: true,
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
