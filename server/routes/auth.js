const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

//MIDDLEWARES
const validateRegistration = require("../middlewares/validate/ValidateRegistration");
const validateLogin = require("../middlewares/validate/ValidateLogin");


//Schemas
const User = require('../models/user');

//Utils
const { signAccessToken } = require('../utils/tokens') 

router.post('/register', validateRegistration, async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        username: username.trim(),
        email: email,
        password: passwordHash, // store the hash
      });

      // Issue tokens on successful registration (optional but common)
      const accessToken = signAccessToken(user);
      console.log(user.username, "was successfuly created");
      return res.status(201).json({
        accessToken,
        user: { id: user._id, username: user.username, email: user.email, role: user.role }
      });
    } catch (err) {
      // Handle duplicate key error from unique indexes (email/username)
      if (err?.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || 'field';
        return res.status(409).json({ message: `${field} already in use` });
      }
      console.error(err);
      return res.status(500).json({ message: 'Something went wrong' });
    }
  }
);

router.post('/login', validateLogin, async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = signAccessToken(user);

        return res.json({
            token: token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch(err) {
        console.error(err);
        return res.status(500).json({ message: 'Something went wrong' });
    }
})

module.exports = router;