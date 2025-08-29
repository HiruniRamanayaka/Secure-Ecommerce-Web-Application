// 404 handler
const notFound = (req, res, _next) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
};

// Centralized error handler
const errorHandler = (err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  const message = status === 500 ? 'Internal Server Error' : err.message;
  res.status(status).json({ error: message });
};

module.exports = { notFound, errorHandler };
