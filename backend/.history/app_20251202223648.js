const express = require("express");
const cors = require("cors");
const app = express();
const connect = require("./routes/contact");
const path = require("path");

require("./conn/connection");

app.use(express.json());
app.use(cors());

app.use("/api/v1/contact", connect);
const PORT = process.env.PORT || 1000;

app.get("/", (req, res) => {
  app.use(express.static(path.resolve()))
}


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
