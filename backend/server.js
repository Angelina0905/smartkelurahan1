const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mysql = require("mysql2");
const { Storage } = require("@google-cloud/storage");
require("dotenv").config();

app.use((req, res, next) => {
  console.log("🔥 REQUEST MASUK:", req.method, req.url);
  next();
});

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);
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
  limits: { fileSize: 10 * 1024 * 1024 }
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
app.post("/pengaduan", upload.single("file"), async (req, res) => {
  try {

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "File tidak masuk" });
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const blob = bucket.file(fileName);

    // =========================
    // UPLOAD KE GCS (PROMISE)
    // =========================
    await new Promise((resolve, reject) => {
      const stream = blob.createWriteStream({
        resumable: false,
        contentType: req.file.mimetype,
      });

      stream.on("error", (err) => {
        console.log("GCS ERROR:", err);
        reject(err);
      });

      stream.on("finish", () => {
        resolve();
      });

      stream.end(req.file.buffer);
    });

    const fileUrl = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${fileName}`;

    // =========================
    // SIMPAN KE MYSQL (PROMISE)
    // =========================
    await new Promise((resolve, reject) => {
      db.query(
        "INSERT INTO pengaduan (nama, deskripsi, file_url) VALUES (?, ?, ?)",
        [req.body.nama, req.body.deskripsi, fileUrl],
        (err, result) => {
          if (err) {
            console.log("DB ERROR:", err);
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });

    return res.json({
      message: "Upload sukses 🚀",
      fileUrl
    });

  } catch (err) {
    console.log("❌ SERVER ERROR FULL:", err);
    return res.status(500).json({
      error: err.message
    });
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
