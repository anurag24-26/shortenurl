const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { nanoid } = require("nanoid");

// Path to DB file
const dbFile = path.join(__dirname, "../data/urls.json");

// Ensure data directory and file exist
const ensureDB = () => {
  const dir = path.dirname(dbFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, JSON.stringify([]));
};

// Read the DB
function readDB() {
  ensureDB();
  return JSON.parse(fs.readFileSync(dbFile));
}

// Write to the DB
function writeDB(data) {
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

// Handle POST request to shorten a URL
router.post("/shorten", (req, res) => {
  const { longUrl, customAlias } = req.body;
  let db = readDB();

  const aliasExists = db.some((e) => e.shortId === customAlias);
  if (customAlias && aliasExists) {
    return res.send(
      `<p style="color:red;">Custom alias already in use. Try another.</p><a href="/">Go Back</a>`
    );
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
        <div style="font-family:sans-serif;">
            <p><strong>Short URL:</strong> 
                <a href="/${shortId}" target="_blank">http://localhost:3000/${shortId}</a>
            </p>
            <p><a href="/">Shorten another URL</a></p>
        </div>
    `);
});

// Redirect shortened URL
router.get("/:shortId", (req, res) => {
  const db = readDB();
  const entry = db.find((e) => e.shortId === req.params.shortId);
  if (entry) {
    entry.clicks += 1;
    writeDB(db);
    return res.redirect(entry.longUrl);
  } else {
    res.status(404).send('<h2>404 - URL Not Found</h2><a href="/">Go Home</a>');
  }
});

module.exports = router;
