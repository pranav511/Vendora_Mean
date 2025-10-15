const { body } = require("express-validator");

// Registration validation
exports.registerValidator = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("phone").notEmpty().withMessage("Phone number is required"),
];

// OTP verification validation
exports.verifyOtpValidator = [
  body("email").optional().isEmail().withMessage("Valid email required"),
  body("phone").optional().notEmpty().withMessage("Valid phone required"),
  body("otp")
    .isNumeric()
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits"),
];

// Login validation
exports.loginValidator = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password required"),
];

// Forgot password validation
exports.forgotPasswordValidator = [
  body("email").isEmail().withMessage("Valid email required"),
];

// Reset password validation
exports.resetPasswordValidator = [
  body("email").isEmail().withMessage("Valid email required"),
  body("otp").isNumeric().isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  body("newPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

// Resend OTP validation
exports.resendOtpValidator = [
  body("email").isEmail().withMessage("Valid email required"),
];
