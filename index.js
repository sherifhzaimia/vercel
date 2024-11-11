const express = require("express");
const app = express();
let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

app.get("/api", async (req, res) => {
  let options = {};
  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security", "--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
      ignoreHTTPSErrors: true,
    };
  }

  try {
    let browser = await puppeteer.launch(options);
    let page = await browser.newPage();
    await page.goto("https://www.google.com");
    const title = await page.title();
    await browser.close();
    res.send(title);
  } catch (err) {
    console.error("Error launching Puppeteer:", err);
    res.status(500).send("Error launching Puppeteer");
  }
});

app.get("/api/welcome", (req, res) => {
  res.send("أهلاً بك في API الخاص بنا!");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});

module.exports = app;
