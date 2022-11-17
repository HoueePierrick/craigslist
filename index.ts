import pupeteer from "puppeteer";
import cheerio from "cheerio";

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
  const browser = await pupeteer.launch({ headless: false });
  const page = await browser.newPage();
  // Could add { waitUntil: "networkidle2", timeout: 0 }
  await page.goto("https://sfbay.craigslist.org/search/sof#search=1~thumb~0~5");

  // Getting the HTML from the page
  const html = await page.content();
  const $ = cheerio.load(html);
  $(".titlestring").each((i, e) => {
    console.log($(e).text());
  });
}

main();
