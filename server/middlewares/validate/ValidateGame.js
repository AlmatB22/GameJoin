const { body, validationResult } = require('express-validator');

module.exports = [
    body('title').isString().trim().isLength({ min: 3 }),
    body('description').optional().isString().isLength({ max: 2000 }),
    body('location.address').isString().trim().notEmpty(),
    body('location.lat').isFloat({ min: -90, max: 90 }),
    body('location.lng').isFloat({ min: -180, max: 180 }),
    body('date_time').isISO8601().toDate(),
    body('skill_level').optional().isIn(['beginner', 'intermediate', 'advanced']),
    body('max_players').isInt({ min: 2, max: 50 }),

    (req, res, next) => {
        const errors = validationResult(req);
        const dt = req.body?.date_time instanceof Date ? req.body.date_time : new Date(req.body?.date_time);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        if (isNaN(dt.getTime()) || dt <= new Date()) {
            return res.status(422).json({ errors: [{ path: 'date_time', msg: 'date_time must be in the future' }] });
        }
        next();
    }
]