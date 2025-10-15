const rateLimit = require("express-rate-limit");

export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 requests per IP per window
  message: {
    status: 429,
    message: "Too many OTP requests. Try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
