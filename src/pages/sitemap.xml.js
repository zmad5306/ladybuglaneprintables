import products from "../data/etsy_rss_listings.json";

export async function GET() {
  const base = "https://ladybuglaneprintables.com";

  const staticPages = ["/"];

  const urls = [
    ...staticPages.map(
      (path) => `
      <url>
        <loc>${base}${path}</loc>
        <priority>${path === "/" ? "1.0" : "0.8"}</priority>
      </url>
    `
    ),
    ...products.map(
      (item) => `
      <url>
        <loc>${item.url}</loc>
        <priority>0.5</priority>
      </url>
    `
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.join("\n")}
  </urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
