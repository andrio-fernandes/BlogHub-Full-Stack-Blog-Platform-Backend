require("dotenv").config(); // loads values from .env into process.env
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const commentRoutes = require("./routes/commentRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Create the Express app object. Everything else builds on this.
const app = express();

// Middleware (runs between receiving a request and sending a response):
app.use(cors());           // lets the React frontend (different port) call this API
app.use(express.json());   // parses incoming JSON request bodies into req.body

// ---- Routes (individual route files are added in later steps) ----
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);

// Simple check to confirm the API is alive.
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Blog Platform API is running" });
});

// Any unknown API path returns a clean 404 JSON instead of an HTML page.
app.use(notFound);

// Any thrown error is caught here and returned as JSON.
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start listening for requests.
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
});