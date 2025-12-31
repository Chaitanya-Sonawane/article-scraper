const express = require("express");
const cors = require("cors");

const articleRoutes = require("./src/routes/article.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/articles", articleRoutes);

module.exports = app;
