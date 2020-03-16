const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const pLimit = require("p-limit");

const app = express();
const port = process.env.dev ? 4000 : process.env.PORT;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const limit = pLimit(3);

app.get("/", (req, res, next) => {
  limit(async () => {
    requests++;
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 900,
      height: 400
    });
    try {
      let navigated = false;
      while (!navigated) {
        try {
          await page.goto(`https://www.slader.com/textbook/9781285740621-stewart-calculus-8th-edition/${req.query.page}/exercises/${req.query.problem}/`, {
            timeout: 10000
          });
          navigated = true;
        } catch {
          continue;
        }
      }
      await page.waitFor(".contents, .return-home-button");
      const solution = await page.$(".contents");
      if (!solution) {
        next();
        return;
      }
      let screenshotted = false;
      let image;
      while (!screenshotted) {
        try {
          await page.setViewport({
            width: 900,
            height: Math.floor((await solution.boundingBox()).height) + 400
          });
          image = await solution.screenshot({
            encoding: "base64"
          });
          screenshotted = true;
        } catch (e) {
          continue;
        }
      }
      res.send(image);
    } catch (e) {
      next(e);
    } finally {
      await browser.close();
    }
  });
});

app.listen(port, () => console.log(`App listening on port ${port}.`))