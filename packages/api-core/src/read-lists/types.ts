import { Site } from '../site';

export interface ReadListItem {
	ID: string;
	feed_ID: number;
	site_ID: number;
	tag_ID: number;
	meta: {
		links: {
			feed: string;
		};
		data: {
			feed: ReadListItemFeed | null;
			site: Site | null;
		};
	};
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

export interface ReadList {
	ID: number;
	title: string;
	slug: string;
	description: string;
	owner: string;
	is_owner: boolean;
	is_public: boolean;
	is_immutable?: boolean;
}

export interface ReadSubscribedListsResponse {
	lists: ReadList[];
}

export interface ReadUserListsResponse {
	lists: ReadList[];
}

export interface ReadListResponse {
	list: ReadList;
}

export interface CreateReadListParams {
	title: string;
	description?: string;
	is_public?: boolean;
}

export interface UpdateReadListParams {
	title: string;
	slug: string;
	owner: string;
	description?: string;
	is_public?: boolean;
}
