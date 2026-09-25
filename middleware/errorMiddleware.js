// Central error handling so the API always answers with JSON, never HTML.

// Runs when no route matches the requested URL.
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
};

// Runs for any error passed to next(error). Express calls this after routes.
const errorHandler = (err, req, res, next) => {
  // If a response was already sent, don't try to send again.
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
  });
};

module.exports = { notFound, errorHandler };