import requests
import time
import xml.sax.saxutils as sx
from email.utils import formatdate

API_URL = "https://search.api.frontendmasters.com/site?c=tutorials&so=date&s=20&f=0"
OUTPUT_FILE = "feed.xml"
FEED_TITLE = "Frontend Masters Tutorials"
FEED_LINK = "https://itanyusha.github.io/"
FEED_DESCRIPTION = "Daily updated top tutorials"


def escape_xml(text: str) -> str:
    """
    Escape XML special chars but leave CDATA sections untouched.
    """
    if text is None:
        return ""
    return sx.escape(text, {
        '"': "&quot;",
        "'": "&apos;"
    })


def to_rfc822(timestamp: int) -> str:
    return formatdate(timestamp, usegmt=True)


def generate_rss(items):
    now = formatdate(time.time(), usegmt=True)

    item_blocks = ""
    for item in items:
        data = item["data"]

        title = escape_xml(data["title"])
        link = escape_xml("https://frontendmasters.com" + data["url"])
        description = data.get("subtitle", "")
        pub_date = to_rfc822(data["timestamp"])
        guid = escape_xml(data["id"])
        icon = data.get("iconURL", "")

        item_blocks += f"""
<item>
    <title>{title}</title>
    <link>{link}</link>
    <description><![CDATA[{description}<br><img src="{icon}" />]]></description>
    <pubDate>{pub_date}</pubDate>
    <guid isPermaLink="false">{guid}</guid>
</item>
"""

    return f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
    <title>{escape_xml(FEED_TITLE)}</title>
    <link>{escape_xml(FEED_LINK)}</link>
    <description>{escape_xml(FEED_DESCRIPTION)}</description>
    <lastBuildDate>{now}</lastBuildDate>
    {item_blocks}
</channel>
</rss>
"""


def fetch_items():
    res = requests.get(API_URL)
    res.raise_for_status()
    data = res.json()

    tutorials_section = data["results"][0]
    items = tutorials_section["items"]
    return items


if __name__ == "__main__":
    items = fetch_items()
    rss = generate_rss(items[:20])

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(rss)

    print("Generated feed.xml")
