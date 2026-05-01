const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  type: {
    type: String,
    enum: ['homework', 'project', 'exam', 'lecture', 'event', 'live_class'],
    default: 'event',
  },
  // If the event is specific to a course
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  // The teacher or admin who created the event
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  color: {
    type: String,
    default: 'bg-blue-500', 
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  // Visibility scope: 'global' for all, 'class' for specific groups
  scope: {
    type: String,
    enum: ['global', 'class'],
    default: 'class',
  },
  // targetClass + targetSchool together uniquely scope the event to one school's class
  // (prevents UK Class-1 events leaking to India Class-1 students)
  targetClass: {
    type: String,
    trim: true,
  },
  targetSchool: {
    type: String,
    trim: true,
    default: null,
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Event', EventSchema);