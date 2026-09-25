const jwt = require("jsonwebtoken");

// Creates a signed token that contains the user's id.
// The secret from .env signs it; the browser can't forge tokens it doesn't know.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

module.exports = generateToken;