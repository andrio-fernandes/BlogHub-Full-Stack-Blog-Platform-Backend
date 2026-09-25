const jwt = require("jsonwebtoken");
const User = require("../models/User");

// protect: middleware that runs BEFORE a protected route.
// It reads the token, verifies it, loads the user, and attaches the
// user object to req.user so the controller knows who is making the request.
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Token must look like:  Authorization: Bearer <token>
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "Not authorized, no token" });
      return; // stop here — don't call next()
    }

    const token = authHeader.split(" ")[1];

    // Verify signature + expiration. Throws if the token is bad/expired.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user this token belongs to. Never give out the password hash.
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({ success: false, message: "User not found" });
      return;
    }

    req.user = user;
    next(); // everything is fine, continue to the route handler
  } catch (error) {
    res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};

// adminOnly: runs AFTER protect (so req.user is set). Gives access only to admins.
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
    return;
  }
  res.status(403).json({ success: false, message: "Admin access required" });
};

module.exports = { protect, adminOnly };