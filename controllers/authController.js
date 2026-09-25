const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// Small validation helper so we don't use a big validation library.
const validateRegistration = ({ name, email, password }) => {
  if (!name || !email || !password) return "All fields are required";
  if (name.trim().length < 3) return "Name must be at least 3 characters";
  if (name.trim().length > 50) return "Name must be 50 characters or fewer";
  if (!/^\S+@\S+\.\S+$/.test(email)) return "Please provide a valid email";
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const error = validateRegistration({ name, email, password });
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const cleanEmail = email.toLowerCase().trim();

    // unique:true in the model helps, but checking here gives a friendly message.
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // .create() runs the "pre save" hook in models/User.js, which hashes the password.
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Same message for "no such user" and "wrong password" — don't reveal which.
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get the logged-in user's profile
// @route   GET /api/auth/profile
// @access  Private (requires a valid token via the protect middleware)
const getProfile = async (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  });
};

module.exports = { registerUser, loginUser, getProfile };