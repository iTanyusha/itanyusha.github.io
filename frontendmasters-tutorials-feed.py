import requests
import time
import xml.sax.saxutils as sx
from email.utils import formatdate, parsedate_to_datetime
import re
from datetime import datetime
from zoneinfo import ZoneInfo
from email.utils import format_datetime
import pytz

API_URL = "https://search.api.frontendmasters.com/site?c=tutorials&so=date&s=20&f=0"
OUTPUT_FILE = "rss/frontendmasters-tutorials.xml"
FEED_TITLE = "Frontend Masters Tutorials"
FEED_LINK = f"https://itanyusha.github.io/{OUTPUT_FILE}"
FEED_DESCRIPTION = "Daily updated feed from https://frontendmasters.com/tutorials/?dg=1&c=tutorials&so=date"

def to_rfc822_il(timestamp=None):
    tz = pytz.timezone("Asia/Jerusalem")
    if timestamp is None:
        dt = datetime.now(tz)
    else:
        dt = datetime.fromtimestamp(timestamp, tz)
    return format_datetime(dt)

def escape_xml(text: str) -> str:
    if text is None:
        return ""
    return sx.escape(text, {'"': "&quot;", "'": "&apos;"})


def to_rfc822(timestamp: int) -> str:
    return formatdate(timestamp, usegmt=True)


def fetch_items():
    res = requests.get(API_URL)
    res.raise_for_status()
    data = res.json()
    tutorials_section = data["results"][0]
    return tutorials_section["items"]


def parse_existing_feed():
    """Return list of old items as raw XML and their timestamps/ids"""
    try:
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            xml_text = f.read()
    except FileNotFoundError:
        return []

    # Find all <item>...</item> blocks
    items = []
    for match in re.finditer(r"<item>(.*?)</item>", xml_text, re.DOTALL):
        item_xml = match.group(0)
        # Extract GUID
        guid_match = re.search(r"<guid[^>]*>(.*?)</guid>", item_xml)
        guid = guid_match.group(1) if guid_match else ""
        # Extract pubDate
        date_match = re.search(r"<pubDate>(.*?)</pubDate>", item_xml)
        pubdate_str = date_match.group(1) if date_match else ""
        try:
            ts = parsedate_to_datetime(pubdate_str).timestamp()
        except Exception:
            ts = time.time()
        items.append({"id": guid, "timestamp": ts, "xml": f"""\t{item_xml}\n"""})
    return items

def format_duration(seconds: int) -> str:
    hours, remainder = divmod(seconds, 3600)
    minutes, _ = divmod(remainder, 60)
    if hours > 0:
        return f"{hours}h {minutes}m"
    return f"{minutes} min"

def authors_to_string(authors) -> str:
    return ", ".join(a.get("name", "") for a in authors)

def tags_to_elements(tags) -> str:
    return "\n\t\t".join(f"<category>{sx.escape(t['name'])}</category>" for t in tags)

def build_item_xml(data):
    title = escape_xml(data["title"])
    link = escape_xml("https://frontendmasters.com" + data["url"])
    guid = escape_xml(data["id"])
    pub_date = to_rfc822(data["timestamp"])

    # Build description with subtitle, image, authors, duration
    description_parts = [data.get("subtitle","")]
    if data.get("iconURL"):
        description_parts.append(f'<br><img src="{data["iconURL"]}" />')
    if data.get("meta", {}).get("durationSeconds"):
        description_parts.append(f"<br>Duration: {format_duration(data['meta']['durationSeconds'])}")
    if data.get("authors"):
        description_parts.append(f"<br>Authors: {authors_to_string(data['authors'])}")
    description = "<br>".join(description_parts)
    description_cdata = f"<![CDATA[{description}]]>"

    # Build categories from tags
    categories = tags_to_elements(data.get("tags", []))

    item_xml = f"""\t<item>
        <title>{title}</title>
        <link>{link}</link>
        <description>{description_cdata}</description>
        <pubDate>{pub_date}</pubDate>
        <guid isPermaLink="false">{guid}</guid>
        {categories}
    </item>
    """

    return item_xml


if __name__ == "__main__":
    # Load old items
    old_items = parse_existing_feed()
    existing_ids = {item["id"] for item in old_items}

    # Fetch new items
    new_items_raw = fetch_items()
    new_items = []

    for i in new_items_raw:
        data = i["data"]
        meta = i.get("meta", {})  # <- meta is outside of data
        if data["id"] not in existing_ids:
            xml_block = build_item_xml({
                "id": data["id"],
                "slug": data["slug"],
                "title": data["title"],
                "subtitle": data.get("subtitle", ""),
                "url": data["url"],
                "iconURL": data.get("iconURL", ""),
                "timestamp": data["timestamp"],
                "authors": data.get("authors", []),
                "tags": data.get("tags", []),
                "meta": meta,  # <- pass meta separately
            })
            new_items.append({"id": data["id"], "timestamp": data["timestamp"], "xml": xml_block})

    # Combine old + new, sort by timestamp descending
    all_items = old_items + new_items
    all_items.sort(key=lambda x: x["timestamp"], reverse=True)

    # Build final feed
    items_xml = "\n".join(item["xml"] for item in all_items)
    rss_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
    <title>{escape_xml(FEED_TITLE)}</title>
    <link>{escape_xml(FEED_LINK)}</link>
    <description>{escape_xml(FEED_DESCRIPTION)}</description>
    <lastBuildDate>{to_rfc822_il()}</lastBuildDate>

{items_xml}
</channel>
</rss>
"""

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(rss_xml)

    print(f"Generated frontendmasters-tutorials.xml with {len(all_items)} items (added {len(new_items)})")
