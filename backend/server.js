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


const upload = multer({
  storage: multer.memoryStorage(),
});

/* =========================
   GOOGLE CLOUD STORAGE
========================= */

const storage = new Storage();


const bucket = storage.bucket(process.env.BUCKET_NAME);

/* =========================
   MYSQL
========================= */

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    rejectUnauthorized: false,
  },
});

db.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("MySQL Connected 😭🔥");
  }
});

app.get("/", (req, res) => {
res.send("Backend SmartKelurahan jalan 😭🔥");
});


/* =========================
   API
========================= */

app.post("/pengaduan", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    const blob = bucket.file(Date.now() + "-" + file.originalname);

    const blobStream = blob.createWriteStream();

    blobStream.on("finish", () => {
      const fileUrl = `https://storage.googleapis.com/${process.env.BUCKET_NAME}/${blob.name}`;

      const sql =
        "INSERT INTO pengaduan (nama, deskripsi, file_url) VALUES (?, ?, ?)";

      db.query(sql, [req.body.nama, req.body.deskripsi, fileUrl], (err) => {
        if (err) {
          console.log(err);
          return res.status(500).send(err);
        }

        res.json({
          message: "Pengaduan berhasil 😭🔥",
          fileUrl,
        });
      });
    });

    blobStream.end(file.buffer);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});


app.get("/pengaduan", (req, res) => {
  db.query("SELECT * FROM pengaduan ORDER BY id DESC", (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }

    res.json(result);
  });
});

app.listen(PORT, () => {
  console.log("Server running on ${PORT} 😭🔥");
});
