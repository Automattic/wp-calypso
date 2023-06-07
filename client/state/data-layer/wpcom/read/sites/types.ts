// Feel free to adjust the type, if you find out a discrepancy between what the `/read/sites/${ action.payload.ID }` endpoint returns and the type definition below
export type Site = {
	URL: string;
	domain: string;
	capabilities: unknown;
	description: string;
	name: string;
	slug: string;
	icon?: { ico: string; img: string; media_id: number };
	feed_URL: string;
	subscribers_count: number;
	title: string;
	unseen_count: number;
	feed: unknown;
};
