// Removed "type": "module" from JSON to allow require
import puppeteer from "puppeteer";
import cheerio from "cheerio";
import monogoose from "mongoose";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Listing from "./model/Listing.js";
import { oneResult } from "./model/Listing.js";

// const puppeteer = require("puppeteer");
// const cheerio = require("cheerio");

dotenv.config();

let scrapingresults: oneResult[] = [];

// Function to connect to Mongo DB
async function connectToMongoDB() {
  const MongoDBURI = process.env.MONGODB_URI ? process.env.MONGODB_URI : "";
  await mongoose.connect(MongoDBURI);
  console.log("connected to mongodb");
}

async function scrapeListings(page: puppeteer.Page) {
  // headless: false => the browser will be visible (could be unactivated when ok)
  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();
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

  // .get() mandatory after using a map function
  // const results = $(".titlestring")
  //   .map((i, e) => {
  //     const title = $(e).text();
  //     const url = $(e).attr("href");
  //     return { title, url };
  //   })
  //   .get();
  const listings = $(".thumb-result-container")
    .map((i, e) => {
      // find finds a child element
      const titleElement = $(e).find(".titlestring");
      const timeElement = $(e).find(".when").find("span");
      const hoodElement = $(e).find(".supertitle");
      const title: string = $(titleElement).text();
      const testurl = $(titleElement).attr("href");
      let url = "";
      if (testurl) {
        url = testurl;
      }
      const dateRetrived = $(timeElement).attr("title");
      const datePosted: Date | undefined = dateRetrived
        ? new Date(dateRetrived)
        : undefined;
      const hood: string = $(hoodElement).text().trim();
      return { title, url, datePosted, hood };
    })
    .get();
  return listings;

  // console.log(results);
}

interface temporary {
  title: string;
  url: string;
  datePosted: "" | Date | undefined;
  hood: string;
  jobDescription?: string;
  compensation?: string;
}

async function scrapeJobDescriptions(
  listings: temporary[],
  page: puppeteer.Page
) {
  // ForEach doesn't work with async elements inside
  for (let i = 0; i < listings.length; i++) {
    // Going to each page
    await page.goto(listings[i].url);
    // Loading the HTML content
    const html = await page.content();
    const $ = cheerio.load(html);
    const jobDescription = $("#postingbody")
      .text()
      .split("QR Code Link to This Post")[1]
      .trim();
    listings[i].jobDescription = jobDescription;
    // console.log(listings[i].jobDescription);
    const compensation = $(".attrgroup > span:first-child > b").text();
    listings[i].compensation = compensation;
    // console.log(listings[i].compensation);
    const listingModel = new Listing(listings[i]);
    await listingModel.save();
    await sleep(1000);
  }
}

// Function to make pauses between page queries
async function sleep(milliseconds: number) {
  // Return a promise that will be resolved when setTimeout will be resolved
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function main() {
  // Function to connect to Mongo DB
  connectToMongoDB();
  // { headless: false }
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const listings = await scrapeListings(page);
  const listingsWithJobDescriptions = await scrapeJobDescriptions(
    listings,
    page
  );
  // console.log(listings);
}

// console.log("Before");
// scrapeListings();
// console.log("After");
main();
