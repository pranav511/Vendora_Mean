const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,      // e.g., smtp.gmail.com
  port: process.env.MAIL_PORT,      // e.g., 587
  secure: false,                    // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_USER,    // environment variable
    pass: process.env.MAIL_PASS     // environment variable
  }
});

module.exports = transporter;
