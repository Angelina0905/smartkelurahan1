const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mysql = require("mysql2");
const { Storage } = require("@google-cloud/storage");
require("dotenv").config();

const app = express(); // ✅ HARUS DI ATAS

/* =========================
   MIDDLEWARE
========================= */
app.use((req, res, next) => {
  console.log("🔥 REQUEST MASUK:", req.method, req.url);
  next();
});

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());

/* =========================
   PORT
========================= */
const PORT = process.env.PORT || 8080;

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("Backend SmartKelurahan LIVE 🚀");
});

/* =========================
   MULTER
========================= */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

/* =========================
   GCS
========================= */
const storage = new Storage();
const bucket = storage.bucket(process.env.BUCKET_NAME);

/* =========================
   MYSQL
========================= */
const db = mysql.createConnection({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
});

db.connect((err) => {
  if (err) console.log("MySQL ERROR:", err);
  else console.log("MySQL CONNECTED 🚀");
});

/* =========================
   POST UPLOAD
========================= */
app.post("/pengaduan", upload.single("file"), async (req, res) => {
  try {

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "File tidak masuk" });
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const file = bucket.file(fileName);

    await new Promise((resolve, reject) => {
      const stream = file.createWriteStream({
        resumable: false,
        contentType: req.file.mimetype,
      });

      stream.on("error", reject);
      stream.on("finish", resolve);

      stream.end(req.file.buffer);
    });

    const fileUrl = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${fileName}`;

    await new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO pengaduan (nama, deskripsi, file_url) VALUES (?, ?, ?)",
        [req.body.nama, req.body.deskripsi, fileUrl],
        (err) => {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    return res.json({
      message: "UPLOAD SUCCESS 🚀",
      fileUrl
    });

  } catch (err) {
    console.log("ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

/* =========================
   GET DATA
========================= */
app.get("/pengaduan", (req, res) => {
  db.query("SELECT * FROM pengaduan ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

/* =========================
   START
========================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on", PORT);
});