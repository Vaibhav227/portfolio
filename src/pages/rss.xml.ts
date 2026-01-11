import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { PROFILE } from "../content/profileData";

export const GET: APIRoute = async ({ site }) => {
  const posts = await getCollection("posts");

  // Sort posts by date (newest first)
  posts.sort((a, b) => {
    return (
      new Date(b.data.startDate).getTime() -
      new Date(a.data.startDate).getTime()
    );
  });

  const siteUrl = site?.href || "https://vaibhu.com";
  const blogUrl = `${siteUrl}/posts`;
  const rssUrl = `${siteUrl}/rss.xml`;

  // Generate RSS XML
  const rssItems = posts
    .map((post) => {
      const postUrl = `${siteUrl}/posts/${post.slug}`;
      const pubDate = new Date(post.data.startDate).toUTCString();
      const description = post.data.description || "";
      const imageTag = post.data.image?.url
        ? `<enclosure url="${siteUrl}${post.data.image.url}" type="image/png" />`
        : "";

      return `    <item>
      <title><![CDATA[${post.data.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${description}]]></description>
      <pubDate>${pubDate}</pubDate>
      ${imageTag}
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${PROFILE.name}'s Blog]]></title>
    <link>${blogUrl}</link>
    <description><![CDATA[${PROFILE.site.SEO.description}]]></description>
    <language>${PROFILE.language}</language>
    <managingEditor>${PROFILE.links.mail.replace("mailto:", "")} (${PROFILE.name})</managingEditor>
    <webMaster>${PROFILE.links.mail.replace("mailto:", "")} (${PROFILE.name})</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${rssUrl}" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
