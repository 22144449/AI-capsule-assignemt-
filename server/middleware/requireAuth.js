const jwt = require("jsonwebtoken");

// Reads the JWT from the HttpOnly "token" cookie, verifies it, and attaches
// the verified identity to req.user. This is the ONLY source of user_id
// used anywhere in the app - the frontend never gets to say who it is.
function requireAuth(req, res, next) {
  const token = req.cookies ? req.cookies.token : null;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: no token provided" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, username: payload.username };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: invalid or expired token" });
  }
}

module.exports = requireAuth;
