const { body, validationResult } = require('express-validator');

const ValidateRegistration = [
  body('username')
    .isString()
    .trim()
    .isLength({ min: 3, max: 32 })
    .withMessage('Username must be 3–32 characters'),

  body('email')
    .isEmail()
    .withMessage('Valid email required'),

  body('password')
    .isString()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    req.body.email = req.body.email.toLowerCase();
    next();
  }
];

module.exports = ValidateRegistration;
