const DW_TOP_STORIES_FEED_URL = "https://rss.dw.com/rdf/rss-en-top";
const DW_WEBSITE_URL = "https://www.dw.com/en/";
const DW_SOURCE_NAME = "Deutsche Welle";
const DW_CACHE_URL = "https://sonderise-cache.internal/dw-top-stories";
const DW_CACHE_TTL_SECONDS = 60 * 15;

export interface DwWireItem {
	id: string;
	title: string;
	link: string;
	summary: string;
	publishedAt: string | null;
	topic: string | null;
}

export interface DwWireFeed {
	title: string;
	description: string;
	updatedAt: string | null;
	source: {
		name: string;
		websiteUrl: string;
		feedUrl: string;
	};
	items: DwWireItem[];
}

export async function getDwTopStories(limit = 6): Promise<DwWireFeed> {
	const safeLimit = Math.min(Math.max(Math.trunc(limit) || 6, 1), 12);
	const cache = globalThis.caches?.default;
	const cacheKey = new Request(`${DW_CACHE_URL}?limit=${safeLimit}`);

	if (cache) {
		const cachedResponse = await cache.match(cacheKey);
		if (cachedResponse) {
			return (await cachedResponse.json()) as DwWireFeed;
		}
	}

	try {
		const response = await fetch(DW_TOP_STORIES_FEED_URL, {
			headers: {
				accept: "application/xml, text/xml;q=0.9, application/rss+xml;q=0.8",
			},
		});

		if (!response.ok) {
			throw new Error(`DW RSS request failed with ${response.status}`);
		}

		const xml = await response.text();
		const feed = parseDwFeed(xml, safeLimit);

		if (cache) {
			await cache.put(
				cacheKey,
				new Response(JSON.stringify(feed), {
					headers: {
						"Content-Type": "application/json; charset=utf-8",
						"Cache-Control": `public, max-age=${DW_CACHE_TTL_SECONDS}, s-maxage=${DW_CACHE_TTL_SECONDS}`,
					},
				})
			);
		}

		return feed;
	} catch {
		return createEmptyFeed();
	}
}

function parseDwFeed(xml: string, limit: number): DwWireFeed {
	const channelXml = readFirstNode(xml, "channel");
	const items = readAllNodes(xml, "item")
		.map((itemXml) => parseDwItem(itemXml))
		.filter((item): item is DwWireItem => item !== null)
		.slice(0, limit);

	return {
		title: cleanText(readFirstTag(channelXml, ["title"])) || `${DW_SOURCE_NAME} Top Stories`,
		description:
			cleanText(readFirstTag(channelXml, ["description"])) ||
			"Latest top stories from Deutsche Welle.",
		updatedAt: parseFeedDate(readFirstTag(channelXml, ["dc:date"])),
		source: {
			name: DW_SOURCE_NAME,
			websiteUrl:
				normalizeDwLink(readFirstTag(channelXml, ["link"])) || DW_WEBSITE_URL,
			feedUrl: DW_TOP_STORIES_FEED_URL,
		},
		items,
	};
}

function parseDwItem(itemXml: string): DwWireItem | null {
	const title = cleanText(readFirstTag(itemXml, ["title"]));
	const link = normalizeDwLink(readFirstTag(itemXml, ["link"]));

	if (!title || !link) {
		return null;
	}

	const contentId = cleanText(readFirstTag(itemXml, ["dwsyn:contentID"]));
	const summary = cleanText(readFirstTag(itemXml, ["description"]));
	const topic = cleanText(readFirstTag(itemXml, ["dc:subject"])) || null;

	return {
		id: contentId || link,
		title,
		link,
		summary,
		publishedAt: parseFeedDate(readFirstTag(itemXml, ["dc:date", "pubDate"])),
		topic,
	};
}

function readAllNodes(xml: string, tagName: string): string[] {
	const tagPattern = escapeForRegExp(tagName);
	const pattern = new RegExp(
		`<${tagPattern}\\b[^>]*>([\\s\\S]*?)<\\/${tagPattern}>`,
		"gi"
	);
	const matches: string[] = [];

	for (const match of xml.matchAll(pattern)) {
		if (match[1]) {
			matches.push(match[1]);
		}
	}

	return matches;
}

function readFirstNode(xml: string, tagName: string): string {
	return readAllNodes(xml, tagName)[0] ?? "";
}

function readFirstTag(xml: string, tagNames: string[]): string {
	for (const tagName of tagNames) {
		const tagPattern = escapeForRegExp(tagName);
		const pattern = new RegExp(
			`<${tagPattern}\\b[^>]*>([\\s\\S]*?)<\\/${tagPattern}>`,
			"i"
		);
		const match = xml.match(pattern);

		if (match?.[1]) {
			return match[1];
		}
	}

	return "";
}

function cleanText(value: string): string {
	return decodeXmlEntities(
		value
			.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
			.replace(/<[^>]+>/g, " ")
			.replace(/\s+/g, " ")
			.trim()
	);
}

function parseFeedDate(value: string): string | null {
	if (!value) return null;

	const date = new Date(value);
	return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

function normalizeDwLink(value: string): string {
	if (!value) return "";

	try {
		const url = new URL(decodeXmlEntities(value.trim()));
		url.searchParams.delete("maca");
		return url.toString();
	} catch {
		return decodeXmlEntities(value.trim());
	}
}

function decodeXmlEntities(value: string): string {
	return value
		.replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
			String.fromCodePoint(Number.parseInt(hex, 16))
		)
		.replace(/&#([0-9]+);/g, (_, decimal) =>
			String.fromCodePoint(Number.parseInt(decimal, 10))
		)
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'");
}

function escapeForRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createEmptyFeed(): DwWireFeed {
	return {
		title: `${DW_SOURCE_NAME} Top Stories`,
		description: "Latest top stories from Deutsche Welle.",
		updatedAt: null,
		source: {
			name: DW_SOURCE_NAME,
			websiteUrl: DW_WEBSITE_URL,
			feedUrl: DW_TOP_STORIES_FEED_URL,
		},
		items: [],
	};
}
