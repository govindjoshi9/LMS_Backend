const Event = require('../models/Event');
const { decodeUserSchoolInfo } = require('../utils/generateCode');

// GET /api/events
const getEvents = async (req, res) => {
    try {
        const { role } = req.user;
        const { schoolCode, classCode } = decodeUserSchoolInfo(req.user);

        let query = {};

        if (role === 'student') {
            query = {
                $or: [
                    { scope: 'global' },
                    {
                        scope: 'class',
                        targetSchool: schoolCode,   // "DW01"
                        targetClass:  classCode,    // "A01"
                    },
                ],
            };
        } else if (role === 'teacher') {
            query = {
                $or: [
                    { scope: 'global' },
                    { teacher: req.user._id },
                ],
            };
        } else if (role === 'admin') {
            query = {};
        }

        const events = await Event.find(query).sort({ date: 1 });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /api/events
const createEvent = async (req, res) => {
    try {
        const { title, description, date, type, scope } = req.body;

        if (req.user.role === 'student') {
            return res.status(403).json({ message: 'Students cannot create events' });
        }

        // Always decode school+class from the teacher/admin's own code — never trust body for this
        const { schoolCode, classCode } = decodeUserSchoolInfo(req.user);

        const event = await Event.create({
            title,
            description,
            date,
            type,
            scope,
            targetClass:  scope === 'class' ? classCode  : null,   // "A01"  not "Class 1"
            targetSchool: scope === 'class' ? schoolCode : null,   // "DW01" not "UKDW"
            teacher: req.user._id,
            color:
                type === 'homework' ? 'bg-orange-500' :
                type === 'project'  ? 'bg-emerald-500' :
                type === 'exam'     ? 'bg-red-500' :
                                      'bg-blue-500',
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/events/:id
const deleteEvent = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can delete events' });
        }

        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getEvents, createEvent, deleteEvent };
