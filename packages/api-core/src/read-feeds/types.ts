import type { Railcar } from '@automattic/calypso-analytics';

export enum ReadFeedSearchSort {
	LastUpdated = 'last_updated',
	Relevance = 'relevance',
}

export interface ReadFeedSearchResponse {
	algorithm: string;
	feeds: ReadFeedItem[];
	next_page: string;
	total: number;
}

export interface ReadFeedItem {
	ID: string;
	URL: string;
	blog_ID: string;
	description: string;
	feed_ID: string;
	feed_URL: string;
	image: string;
	is_following: boolean;
	last_checked: string;
	last_update: string;
	marked_for_refresh: boolean;
	meta: {
		links?: {
			self: string;
			[ key: string ]: string;
		};
	};
	name: string;
	next_refresh_time: string | null;
	organization_id: number;
	railcar?: Railcar;
	subscribe_URL: string;
	subscribers_count: number;
	unseen_count: number;
	subscription_id?: number; // Only present if the user is subscribed to the feed.
}
