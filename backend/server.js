const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mysql = require("mysql2");
const { Storage } = require("@google-cloud/storage");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

/* =========================
   HEALTH CHECK (WAJIB CLOUD RUN)
========================= */
app.get("/", (req, res) => {
  res.send("Backend SmartKelurahan LIVE 🚀");
});

/* =========================
   MULTER
========================= */
const upload = multer({
  storage: multer.memoryStorage(),
});

/* =========================
   GOOGLE CLOUD STORAGE
========================= */
let bucket;
try {
  const storage = new Storage();

  if (process.env.BUCKET_NAME) {
    bucket = storage.bucket(process.env.BUCKET_NAME);
  } else {
    console.warn("BUCKET_NAME belum diset");
  }
} catch (err) {
  console.error("GCS error:", err);
}

/* =========================
   MYSQL (SAFE CONNECTION)
========================= */
let db;

function connectDB() {
  try {
    db = mysql.createConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
    });

    db.connect((err) => {
      if (err) {
        console.error("MySQL Error:", err);
        return;
      }
      console.log("MySQL Connected 🚀");
    });
  } catch (err) {
    console.error("DB init error:", err);
  }
}

connectDB();

/* =========================
   API
========================= */
app.post("/pengaduan", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "File tidak ada" });
    }

    const blob = bucket.file(Date.now() + "-" + req.file.originalname);
    const blobStream = blob.createWriteStream();

    blobStream.on("finish", () => {
      const fileUrl = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${blob.name}`;

      const sql =
        "INSERT INTO pengaduan (nama, deskripsi, file_url) VALUES (?, ?, ?)";

      db.query(sql, [req.body.nama, req.body.deskripsi, fileUrl], (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: err });
        }

        res.json({
          message: "Pengaduan berhasil dibuat",
          fileUrl,
        });
      });
    });

    blobStream.end(req.file.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

app.get("/pengaduan", (req, res) => {
  db.query("SELECT * FROM pengaduan ORDER BY id DESC", (err, result) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    res.json(result);
  });
});

/* =========================
   START SERVER (IMPORTANT)
========================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on", PORT);
});