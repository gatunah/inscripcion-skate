const express = require("express");
const app = express();

const port = 3002;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello, world!");
});