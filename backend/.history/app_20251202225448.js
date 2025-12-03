const express = require("express");
const cors = require("cors");
const path = require("path");
const connect = require("./routes/contact");

require("./conn/connection");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/v1/contact", connect);

// Serve static frontend
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// Catch-all route for React routing
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Start server
const PORT = process.env.PORT || 1000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
