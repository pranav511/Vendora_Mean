const { validationResult } = require("express-validator");

/**
 * Middleware to handle validation results from express-validator.
 * If there are errors, it returns a 400 response with all errors.
 * Otherwise, it calls next() to continue.
 */
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return all validation errors in a structured format
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
