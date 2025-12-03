const express = require("express");
const cors = require("cors");
const app = express();
const connect = require("./routes/contact");
const path = require("path");

require("./conn/connection");

app.use(express.json());
app.use(cors());

// --------------------
// 1️⃣ Backend API routes
// --------------------
app.use("/api/v1/contact", connect);

// --------------------
// 2️⃣ Serve Vite React frontend
// --------------------
// Serve static files from frontend/dist
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// For all other routes, send index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// --------------------
// 3️⃣ Start server
// --------------------
const PORT = process.env.PORT || 1000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
