import { EmailDeliveryFrequency } from '../constants';

export type EmailFormatType = 'html' | 'text';

export type DeliveryWindowDayType = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type DeliveryWindowHourType = 0 | 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20 | 22;

export type SubscriptionManagerUserSettings = Partial< {
	mail_option: EmailFormatType;
	delivery_day: DeliveryWindowDayType;
	delivery_hour: DeliveryWindowHourType;
	blocked: boolean;
	email: string;
} >;

export type SubscriptionManagerSubscriptionsCount = {
	blogs: number | null;
	comments: number | null;
	pending: number | null;
};

export type EmailSettingsAPIResponse = {
	settings: SubscriptionManagerUserSettings & {
		errors: {
			[ key: string ]: string[];
		};
	};
};

type SiteSubscriptionMeta = {
	links: {
		site: string;
		feed: string;
	};
};

type SiteSubscriptionDeliveryMethods = {
	email: {
		send_posts: boolean;
		send_comments: boolean;
		post_delivery_frequency: EmailDeliveryFrequency;
		date_subscribed: Date;
	};
	notification: {
		send_posts: boolean;
	};
};

export type PagedQueryResult< TDataType, TKey extends string > = {
	pages: {
		[ K in TKey ]: TDataType[];
	}[];
	pageParams: number;
};

export type SiteSubscription = {
	ID: string;
	blog_ID: string;
	feed_ID: string;
	URL: string;
	date_subscribed: Date;
	delivery_methods: SiteSubscriptionDeliveryMethods;
	name: string;
	organization_id: number;
	unseen_count: number;
	last_updated: Date;
	site_icon: string;
	is_owner: boolean;
	meta: SiteSubscriptionMeta;
};

export type SiteSubscriptionPage = {
	subscriptions: SiteSubscription[];
	total_subscriptions: number;
};

export type SiteSubscriptionsPages = {
	pageParams: [];
	pages: SiteSubscriptionPage[];
};

export type PostSubscription = {
	id: string;
	blog_id: string;
	date_subscribed: Date;
	site_id: string;
	site_title: string;
	site_icon: string;
	site_url: string;
	domain: string;
	organization_id: number;
	post_id: number;
	post_title: string;
	post_excerpt: string;
	post_url: string;
};

export type PendingSiteSubscription = {
	id: string;
	activation_key: string;
	site_title: string;
	site_icon: string;
	site_url: string;
	date_subscribed: Date;
	organization_id: number;
};

export type PendingPostSubscription = {
	id: string;
	blog_id: string;
	date_subscribed: Date;
	site_id: string;
	site_title: string;
	site_icon: string;
	site_url: string;
	domain: string;
	organization_id: number;
	post_id: number;
	post_title: string;
	post_excerpt: string;
	post_url: string;
};

export type PendingSiteSubscriptionsResult = {
	pendingSites: PendingSiteSubscription[];
	totalCount: number;
};

export type PendingPostSubscriptionsResult = {
	pendingPosts: PendingPostSubscription[];
	totalCount: number;
};
