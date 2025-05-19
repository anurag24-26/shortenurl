const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { nanoid } = require("nanoid");

// CONFIG: Change this to your actual base URL (not localhost in production)
const BASE_URL ="https://shortenurl-64k8.onrender.com";
// Replace with your real domain

// Path to DB file
const dbFile = path.join(__dirname, "../data/urls.json");

// Ensure DB file and folder exist
const ensureDB = () => {
  const dir = path.dirname(dbFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify([]));
};

// Read DB
function readDB() {
  ensureDB();
  return JSON.parse(fs.readFileSync(dbFile));
}

// Write DB
function writeDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

// POST /shorten - Shorten a URL
router.post("/shorten", (req, res) => {
  const { longUrl, customAlias } = req.body;
  let db = readDB();

  const aliasExists = db.some((e) => e.shortId === customAlias);
  if (customAlias && aliasExists) {
    return res.send(`
      <div style="font-family: Arial, sans-serif; padding: 20px; color: red;">
        <h2>Custom alias already in use. Try another.</h2>
        <a href="/" style="color: blue; text-decoration: underline;">Go Back</a>
      </div>
    `);
  }

  const shortId = customAlias || nanoid(6);
  const newEntry = {
    longUrl,
    shortId,
    clicks: 0,
    premium: !!customAlias,
  };

  db.push(newEntry);
  writeDB(db);

  res.send(`
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: green;">URL Shortened Successfully!</h2>
      <p><strong>Short URL:</strong> 
        <a href="${BASE_URL}/${shortId}" target="_blank" style="color: blue;">
          ${BASE_URL}/${shortId}
        </a>
      </p>
      <a href="/" style="color: #555;">Shorten another URL</a>
    </div>
  `);
});

// GET /:shortId - Redirect to original URL
router.get("/:shortId", (req, res) => {
  const db = readDB();
  const entry = db.find((e) => e.shortId === req.params.shortId);

  if (entry) {
    entry.clicks += 1;
    writeDB(db);
    return res.redirect(entry.longUrl);
  }

  res.status(404).send(`
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #b91c1c;">
      <h2>404 - URL Not Found</h2>
      <a href="/" style="color: blue;">Go Home</a>
    </div>
  `);
});

module.exports = router;