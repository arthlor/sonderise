import type { APIRoute } from "astro";
import { getDwTopStories } from "../../utils/dw-wire";

export const GET: APIRoute = async () => {
	const feed = await getDwTopStories(8);

	return new Response(JSON.stringify(feed), {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "public, max-age=900, s-maxage=900",
		},
	});
};
