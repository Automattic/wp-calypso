export interface ReaderFollowState {
	followFeedLoading: string[];
	items: ReaderFollowItemType;
	itemsCount: number;
	lastSyncTime: number | null;
}

export type ReaderFollowItemType = { [ key: string ]: ReaderFollowItem };

export interface ReaderFollowItem {
	alias_feed_URLs: string[];
	blog_ID: number;
	date_subscribed: number;
	delivery_methods: {
		email: {
			date_subscribed: string; // date in ISO format?
			post_delivery_frequency: string;
			send_comments: boolean;
			send_posts: boolean;
		};
		notification: {
			send_posts: boolean;
		};
	};
	feed_ID: number;
	feed_URL: string;
	ID: number;
	is_following: boolean;
	is_owner: boolean;
	last_updated: number;
	name: string;
	organization_id: number;
	site_icon: string | null;
	unseen_count: number;
	URL: string;
}
