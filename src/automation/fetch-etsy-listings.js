const fetch = require("node-fetch"); // v2
const cheerio = require("cheerio");
const xml2js = require("xml2js");
const fs = require("fs");

const RSS_URL = "https://www.etsy.com/shop/LadyBugLanePrintable/rss";
const OUTPUT_JSON = "src/data/etsy_rss_listings.json";

async function parseRSS(xml) {
  const parser = new xml2js.Parser();
  const result = await parser.parseStringPromise(xml);
  return result.rss.channel[0].item.map((item) => ({
    title: item.title[0],
    link: item.link[0],
    pubDate: item.pubDate[0],
  }));
}

async function getImageFromListing(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html",
      },
    });

    const html = await res.text();
    const $ = cheerio.load(html);
    const image = $('meta[property="og:image"]').attr("content");

    return image || null;
  } catch (err) {
    console.error(`❌ Error fetching image for ${url}: ${err.message}`);
    return null;
  }
}

(async () => {
  try {
    const res = await fetch(RSS_URL);
    const xml = await res.text();

    const listings = await parseRSS(xml);
    const results = [];

    for (const item of listings) {
      const image = await getImageFromListing(item.link);
      results.push({
        title: item.title,
        url: item.link,
        date: item.pubDate,
        image,
      });
      console.log(`✅ Fetched: ${item.title}`);
    }

    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(results, null, 2));
    console.log(
      `\n🎉 Done! Saved ${results.length} listings to ${OUTPUT_JSON}`
    );
  } catch (err) {
    console.error("Failed to fetch Etsy RSS feed:", err.message);
  }
})();
