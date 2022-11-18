// Removed "type": "module" from JSON to allow require
import puppeteer from "puppeteer";
import cheerio from "cheerio";

// const puppeteer = require("puppeteer");
// const cheerio = require("cheerio");

interface oneResult {
  title: string;
  datePosted: Date;
  neighborhood: string;
  url: string;
  jobdescription: string;
  compensation: string;
}
let scrapingresults: oneResult[] = [];

async function main() {
  // headless: false => the browser will be visible (could be unactivated when ok)
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  // Works only with networkidle0 !!!
  await page.goto(
    "https://sfbay.craigslist.org/search/sof#search=1~thumb~0~5",
    { waitUntil: "networkidle0", timeout: 0 }
  );

  // Getting the HTML from the page
  const html = await page.content();
  const $ = cheerio.load(html);
  // const feedback = $(e).text();
  // $(".titlestring").each((i, e) => console.log($(e).text()));

  // The issue was that it wasn't getting the array associated with ".titlestring"
  // console.log($(".titlestring").length);

  // Getting the element attribute href
  // $(".titlestring").each((i, e) => {
  //   console.log($(e).attr("href"));
  // });

  const results = $(".titlestring").map((i, e) => {
    const title = $(e).text();
    const url = $(e).attr("href");
    return { title, url };
  });
  console.log(results);
}

// console.log("Before");
main();
// console.log("After");
