export interface FollowApiDeliveryMethods {
	email?: {
		date_subscribed?: string;
		post_delivery_frequency?: string;
		send_comments?: boolean;
		send_posts?: boolean;
	};
	notification?: {
		send_comments?: boolean;
		send_posts?: boolean;
	};
}

export interface FollowDeliveryMethods {
	email?: {
		date_subscribed?: Date;
		post_delivery_frequency?: string;
		send_comments?: boolean;
		send_posts?: boolean;
	};
	notification?: {
		send_comments?: boolean;
		send_posts?: boolean;
	};
}

export interface FollowSubscriptionMeta {
	links: {
		site: string;
		feed: string;
	};
}

export interface FollowApiSubscription {
	ID?: string | number;
	URL: string;
	blog_ID?: string | number | null;
	feed_ID?: string | number | null;
	date_subscribed?: string;
	last_updated?: string;
	delivery_methods?: FollowApiDeliveryMethods;
	is_owner?: boolean;
	organization_id?: number | null;
	name?: string;
	unseen_count?: number;
	site_icon?: string | null;
	is_paid_subscription?: boolean;
	is_wpforteams_site?: boolean;
	is_rss?: boolean;
	meta?: FollowSubscriptionMeta;
	is_comp?: boolean;
	comp_id?: number;
}

export interface SiteSubscriptionItem {
	ID?: number | string;
	URL: string;
	feed_URL: string;
	blog_ID?: number | string | null;
	feed_ID?: number | string | null;
	date_subscribed?: Date;
	last_updated?: Date;
	delivery_methods?: FollowDeliveryMethods;
	is_owner?: boolean;
	organization_id?: number | null;
	name?: string;
	unseen_count?: number;
	site_icon?: string | null;
	is_following: boolean;
	alias_feed_URLs?: string[];
	error?: unknown;
	is_paid_subscription?: boolean;
	is_wpforteams_site?: boolean;
	is_rss?: boolean;
	meta?: FollowSubscriptionMeta;
	is_comp?: boolean;
	comp_id?: number;
	isDeleted?: boolean;
	resubscribed?: boolean;
}

export interface SiteSubscriptionsApiResponse {
	subscriptions?: FollowApiSubscription[];
	total_subscriptions?: number;
	page: number;
	number: number;
}

export interface SiteSubscriptionsPage {
	subscriptions: SiteSubscriptionItem[];
	totalCount: number | null;
	page: number;
	number: number;
}

export interface FollowSiteParams {
	feedUrl?: string;
	source?: string;
	subscriptionId?: number | string;
	blogId?: number | string;
	emailId?: string;
}

export interface FollowSiteResponse {
	subscribed?: boolean;
	subscription?: FollowApiSubscription;
	info?: unknown;
}

export interface UnfollowSiteParams {
	feedUrl?: string;
	source?: string;
	subscriptionId?: number | string;
	blogId?: number | string;
	emailId?: string;
}

export interface UnfollowSiteResponse {
	subscribed?: boolean;
}

export interface FollowDeliveryParams {
	blogId: number;
	sendPosts?: boolean;
	sendComments?: boolean;
	deliveryFrequency?: string;
}

export interface FollowDeliveryResponse {
	subscribed?: boolean;
	success?: boolean;
}
