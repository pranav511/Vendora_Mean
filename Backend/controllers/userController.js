const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/mailer");
const client = require("../config/twilio");

exports.registerUser = async (req, res, next) => {
  const { name, email, password, phone, role } = req.body;
  try {
    const [exist] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    console.log(exist)
    if (exist.length > 0) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    await db.query(
      "INSERT INTO users (name, email, phone, role, password, otp, verified) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, email, phone, role, hashed, otp, 0]
    );

    // Send OTP via email
    const mailSender = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Vendora Email Verification OTP",
      text: `Your OTP is ${otp}`
    });

    // Send OTP via SMS (optional)
    const phoneSender = await client.messages.create({
      body: `Vendora OTP: ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: phone
    });

    if(phoneSender && mailSender){
      res.status(201).json({ message: "User registered. OTP sent." });
    }else{
      "Please check your phone and mail"
    }

   
  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  const { email, otp, phone } = req.body;
  try {
    let user;

    // Find user either by email or phone
    if (email) {
      const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);
      user = rows[0];
    } else if (phone) {
      const [rows] = await db.query("SELECT * FROM users WHERE phone=?", [phone]);
      user = rows[0];
    }

    // If user not found
    if (!user) return res.status(404).json({ message: "User not found" });

    // If already verified
    if (user.verified === 1)
      return res.status(200).json({ message: "User already verified" });

    // If OTP invalid
    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    // If everything OK — verify the user
    await db.query("UPDATE users SET verified=1, otp=NULL WHERE id=?", [user.id]);
    res.status(200).json({ message: "User verified successfully" });

  } catch (err) {
    next(err);
  }
};

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const [user] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    console.log(user);
    
    if (user.length === 0) return res.status(404).json({ message: "User not found" });

    if (!user[0].verified) return res.status(403).json({ message: "Please verify email first" });

    const valid = await bcrypt.compare(password, user[0].password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user[0].id, email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    const [user] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    if (user.length === 0)
      return res.status(404).json({ message: "Email not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.query(
      "UPDATE users SET reset_otp=?, reset_expiry=? WHERE email=?",
      [otp, expiry, email]
    );

    // Send Email
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Vendora Password Reset OTP",
      text: `Your password reset OTP is ${otp}`,
    });

    // ✅ Send SMS only if phone exists and Twilio setup is valid
    if (user[0].phone) {
      const phoneNumber =
        user[0].phone.startsWith("+") ? user[0].phone : `+91${user[0].phone}`; // auto-format
      await client.messages.create({
        body: `Vendora reset OTP: ${otp}`,
        from: process.env.TWILIO_PHONE,
        to: phoneNumber,
      });
    }

    res.json({ message: "Password reset OTP sent successfully" });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  try {
    const [user] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    if (user.length === 0)
      return res.status(404).json({ message: "User not found" });

    const record = user[0];
    if (record.reset_otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (new Date() > new Date(record.reset_expiry))
      return res.status(400).json({ message: "OTP expired" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query(
      "UPDATE users SET password=?, reset_otp=NULL, reset_expiry=NULL WHERE email=?",
      [hashed, email]
    );

    res.json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};

exports.resendOtp = async (req, res, next) => {
  const { email } = req.body;
  try {
    const [user] = await db.query("SELECT * FROM users WHERE email=?", [email]);
    if (user.length === 0)
      return res.status(404).json({ message: "User not found" });

    if (user[0].verified)
      return res.status(400).json({ message: "User already verified" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    await db.query("UPDATE users SET otp=? WHERE email=?", [otp, email]);

    // Send Email
    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Vendora - Resend OTP",
      text: `Your new OTP is ${otp}`,
    });

    // ✅ Send SMS with formatted number
    if (user[0].phone) {
      const phoneNumber =
        user[0].phone.startsWith("+") ? user[0].phone : `+91${user[0].phone}`;
      await client.messages.create({
        body: `Your new Vendora OTP is ${otp}`,
        from: process.env.TWILIO_PHONE,
        to: phoneNumber,
      });
    }

    res.json({ message: "New OTP sent successfully" });
  } catch (err) {
    next(err);
  }
};

