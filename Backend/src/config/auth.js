// Centralized Auth0 JWT validation using express-oauth2-jwt-bearer

const { auth } = require('express-oauth2-jwt-bearer');

// Creates middleware that validates JWTs issued by Auth0.
const jwtCheck = auth({
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  audience: process.env.API_AUDIENCE,
  tokenSigningAlg: 'RS256',
});

/*
  Extracts a normalized user object from req.auth (set by jwtCheck).
  Adds roles from custom namespace claim.
 */
const getUserFromReq = (req) => {
  const claims = req.auth || {};
  const ns = process.env.AUTH0_ROLES_NAMESPACE || 'https://coffee-shop-app/roles';
  const roles = Array.isArray(claims[ns]) ? claims[ns] : [];

  return {
    sub: claims.sub,     // The unique user ID from Auth0
    email: claims.email,
    name: claims.name || claims.nickname || '',
    roles,
  };
};

module.exports = { jwtCheck, getUserFromReq };
