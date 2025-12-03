const express = require("express");
const cors = require("cors");
const path = require("path");
const connect = require("./routes/contact");

require("./conn/connection");

const app = express();

app.use(cors());
app.use(express.json());

// 1️⃣ Backend API routes (pehle)
app.use("/api/v1/contact", connect);

// 2️⃣ Serve frontend (Vite dist folder)
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// 3️⃣ Catch-all route for React routes
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// 4️⃣ Start server
const PORT = process.env.PORT || 1000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
