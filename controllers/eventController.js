const Event = require('../models/Event');

// @desc    Get events based on user role and class
// @route   GET /api/events
const getEvents = async (req, res) => {
    try {
        const { role, className } = req.user; // req.user populated by auth middleware

        let query = {};

        if (role === 'student') {
            // Students see global events AND events for their class
            query = {
                $or: [
                    { scope: 'global' },
                    { scope: 'class', targetClass: className }
                ]
            };
        } else if (role === 'teacher') {
            // Teachers see events they created OR global events
            query = {
                $or: [
                    { scope: 'global' },
                    { teacher: req.user._id }
                ]
            };
        } else if (role === 'admin') {
            // Admins see everything
            query = {};
        }

        const events = await Event.find(query).sort({ date: 1 });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new event
// @route   POST /api/events
const createEvent = async (req, res) => {
    try {
        const { title, description, date, type, scope, targetClass } = req.body;

        if (req.user.role === 'student') {
            return res.status(403).json({ message: 'Students cannot create events' });
        }

        const event = await Event.create({
            title,
            description,
            date,
            type,
            scope,
            targetClass: scope === 'class' ? (targetClass || req.user.className) : null,
            teacher: req.user._id,
            color: type === 'homework' ? 'bg-orange-500' : type === 'project' ? 'bg-emerald-500' : 'bg-blue-500'
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can delete events' });
        }

        const event = await Event.findByIdAndDelete(id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getEvents,
    createEvent,
    deleteEvent
};
