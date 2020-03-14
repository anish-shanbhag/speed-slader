const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  setTimeout(() => res.send(req.query), Math.random() * 2);
  //res.send(req)
});

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))