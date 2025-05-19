const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const shortenerRoutes = require("./routes/shortener");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files from "public"
app.use("/public", express.static("public"));

// Route for root - serve HTML form
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Route for shortening logic
app.use("/", shortenerRoutes);

// Start server
app.listen(3000, () => console.log("Server running at http://localhost:3000"));
