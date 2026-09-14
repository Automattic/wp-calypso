import type { Site } from '../site';

// List items are polymorphic: a feed item carries `feed_ID`, a site item carries
// `site_ID`, a tag item carries `tag_ID`. Optimistic-update placeholders may
// only have one of these. Every field is therefore optional / nullable.
export interface ReadListItem {
	ID?: string;
	feed_ID?: number | null;
	site_ID?: number | null;
	tag_ID?: number | null;
	meta?: {
		links?: {
			feed?: string;
			site?: string;
			tag?: string;
		};
		data?: {
			feed?: ReadListItemFeed | null;
			site?: Site | null;
			tag?: { tag: ReadListItemTag } | null;
		};
	};
}

export interface ReadListItemTag {
	ID: number;
	slug: string;
	title?: string;
	display_name?: string;
	URL?: string;
}

export interface ReadListItemFeed {
	blog_ID: string;
	feed_ID: string;
	blog_owner: {
		ID: number;
		name: string;
	};
	name: string;
	URL: string;
	feed_URL: string;
	subscribers_count: number;
	is_following: boolean;
	last_update: string;
	last_checked: string;
	marked_for_refresh: boolean;
	next_refresh_time: string | null;
	organization_id: number;
	subscription_id: string;
	unseen_count: number;
	meta: object;
	image: string;
	description: string;
}

export interface ReadListItemsResponse {
	list_ID: number;
	success: boolean;
	items: ReadListItem[];
	page: number;
	number: number;
	total_items: number;
}
