const express = require("express");
const router = express.Router();
const {
  registerUser,
  verifyOtp,
  loginUser,
  forgotPassword,
  resetPassword,
  resendOtp
} = require("../controllers/userController");

const { validate } = require("../middelware/validator");

const {
  registerValidator,
  verifyOtpValidator,
  resendOtpValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator
} = require("../validators/userValidator");

// Routes
router.post("/register", registerValidator, validate, registerUser);
router.post("/verify-otp", verifyOtpValidator, validate, verifyOtp);
router.post("/login", loginValidator, validate, loginUser);
router.post("/resend-otp", resendOtpValidator, validate, resendOtp);
router.post("/forgot-password", forgotPasswordValidator, validate, forgotPassword);
router.post("/reset-password", resetPasswordValidator, validate, resetPassword);


module.exports = router;
