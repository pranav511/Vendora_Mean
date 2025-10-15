const { body } = require("express-validator");

exports.registerValidator = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Minimum 6 characters required"),
  body("phone").notEmpty().withMessage("Phone number is required"),
];

exports.verifyOtpValidator = [
  body("otp")
    .isNumeric()
    .isLength({ min: 6, max: 6 })
    .withMessage("Valid 6-digit OTP required"),

  // Either email or phone must be provided
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.phone) {
      throw new Error("Either email or phone is required");
    }
    if (req.body.email && !/\S+@\S+\.\S+/.test(req.body.email)) {
      throw new Error("Valid email required");
    }
    if (req.body.phone && !/^\+?\d{10,15}$/.test(req.body.phone)) {
      throw new Error("Valid phone number required");
    }
    return true;
  })
];

exports.loginValidator = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password required")
];

exports.forgotPasswordValidator = [
  body("email").isEmail().withMessage("Valid email required")
];

exports.resetPasswordValidator = [
  body("email").isEmail(),
  body("otp").isNumeric().isLength({ min: 6, max: 6 }),
  body("newPassword").isLength({ min: 6 }).withMessage("Min 6 chars password")
];

exports.resendOtpValidator = [
  body("email").isEmail().withMessage("Valid email required")
];
