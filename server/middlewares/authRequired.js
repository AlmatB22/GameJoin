const jwt = require('jsonwebtoken');

module.exports = function authRequired(req, res, next) {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

    if (!token) {
        return res.status(401).json({message: "Missing auth token"});
    } 

    try {
        const payload = jwt.verify(token, "SECRET");
        req.user = {id: payload.sub, role: payload.role};
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token"});
    }
};