const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 4000;

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(cors());

app.get("/api", async (req, res, next) => {
  console.log("Received request.");
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  console.log("Launched browser.");
  const page = await browser.newPage();
  await page.setViewport({
    width: 900,
    height: 400
  });
  try {
    await page.goto(`https://www.slader.com/textbook/9781285740621-stewart-calculus-8th-edition/${req.query.page}/exercises/${req.query.problem}/`);
    await page.waitFor(".contents, .return-home-button");
    const solution = await page.$(".contents");
    if (!solution) {
      next(new Error(`Problem ${req.query.problem} is not on page ${req.query.page}.`));
      return;
    }
    await page.setViewport({
      width: 900,
      height: Math.floor((await solution.boundingBox()).height) + 400
    });
    const image = await solution.screenshot({
      encoding: "base64"
    });
    console.log("Successfully screenshotted solution.");
    res.send(image);
  } catch (e) {
    next(e);
  } finally {
    console.log("Browser closed.");
    await browser.close();
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.listen(port, () => console.log(`App listening on port ${port}.`));