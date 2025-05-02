const express = require("express");
const mysql = require("mysql2");
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Environment variables for MySQL connection
const DB_HOST = process.env.DB_HOST || "mysql-primary.db.svc.cluster.local";
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "xxxxxxx";
const DB_NAME = process.env.DB_NAME || "mydb";

// Create MySQL connection pool
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
});

// Handle pool connection errors
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.message);
    return;
  }
  console.log("Connected to MySQL database");
  connection.release();
});

// Route to log IP address
app.post("/log-ip", (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  pool.query("INSERT INTO ip_logs (ip_address) VALUES (?)", [ip], (err) => {
    if (err) {
      console.error("Error logging IP:", err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: `IP ${ip} logged successfully` });
  });
});

// Start the server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
