const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,  // max 10 connections
  queueLimit: 0          // unlimited queued requests
});

// Example of using async/await
(async ()=> {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL Database with Pool");
    connection.release(); // release connection back to pool
  } catch (err) {
    console.error("DB Connection Failed:", err.message);
  }
})();

// Run test
// testConnection();

module.exports = pool;
