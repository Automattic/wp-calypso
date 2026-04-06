export interface ReadFeedSiteResponse {
	ID: number;
	URL: string;
	description: string;
	feed_ID: number;
	feed_URL?: string;
	icon?: { ico: string; img: string };
	is_following: boolean;
	name?: string;
	title?: string;
}
