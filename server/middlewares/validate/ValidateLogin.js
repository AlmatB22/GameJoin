const { body, validationResult } = require('express-validator');

const ValidateLogin = [
    body('email')
    .isEmail()
    .withMessage('Please enter correct email'),

    body('password')
    .isString()
    .isLength({min: 6}),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        req.body.email = req.body.email.toLowerCase();
        next();
    }
]

module.exports = ValidateLogin;