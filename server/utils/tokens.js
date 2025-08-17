const jwt = require('jsonwebtoken');

// Simple non-expiring token
const signAccessToken = (user) => {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    "SECRET"
  );
};

module.exports = { signAccessToken };
