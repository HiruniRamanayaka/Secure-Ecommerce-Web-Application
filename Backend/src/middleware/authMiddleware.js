// Role-based access controls based on Auth0 roles claim.

const { getUserFromReq } = require('../config/auth');

/*
    Attaches a normalized user to req.user (after jwtCheck has verified token).
 */
const attachUser = (req, _res, next) => {
  req.user = getUserFromReq(req);
  next();
};

/*
    Require a logged-in user (jwtCheck already did this; this ensures req.user exists).
 */
const requireUser = (req, res, next) => {
  if (!req.user || !req.user.sub) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
};

/**
 * Require one of the specified roles.
 * Example: requireRole('admin') or requireRole('admin', 'user')
 */
const requireRole = (...rolesRequired) => (req, res, next) => {
  const userRoles = req.user?.roles || [];
  const ok = rolesRequired.some((r) => userRoles.includes(r));
  if (!ok) return res.status(403).json({ error: 'Forbidden: insufficient role' });
  return next();
};

/**
 * Ensure resource belongs to the user or user is admin.
 * Use for endpoints like /users/:sub or /orders/:id after loading resource owner.
 * (This middleware is for routes where users can access only their own data, unless they’re an admin.)
 */
const requireSelfOrAdmin = (ownerSubAccessor) => (req, res, next) => {
  const isAdmin = (req.user?.roles || []).includes('admin');
  const ownerSub = typeof ownerSubAccessor === 'function'
    ? ownerSubAccessor(req)
    : ownerSubAccessor;

  if (isAdmin || (req.user?.sub && req.user.sub === ownerSub)) return next();
  return res.status(403).json({ error: 'Forbidden' });
};

module.exports = { attachUser, requireUser, requireRole, requireSelfOrAdmin };
