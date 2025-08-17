// Usage: requireRole('host')  or  requireRole('host', 'admin')
module.exports = (...allowed) => {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !allowed.includes(role)) {
      return res.status(403).json({ message: 'Forbidden: you do not have permission for this action' });
    }
    next();
  };
};
