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

export type SiteSubscriptionDeliveryMethods = {
	email?: {
		send_posts: boolean;
		send_comments?: boolean;
		post_delivery_frequency: EmailDeliveryFrequency;
		date_subscribed?: Date;
	};
	notification?: {
		send_posts: boolean;
		send_comments?: boolean;
	};
};

export type PagedQueryResult< TDataType, TKey extends string > = {
	pages: {
		[ K in TKey ]: TDataType[];
	}[];
	pageParams: number;
};

export type SiteSubscriptionsResponseItem = {
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
	is_wpforteams_site: boolean;
	is_paid_subscription: boolean;
	is_gift: boolean;
	gift_id: number;
	is_rss: boolean;
	isDeleted: boolean;
	resubscribed: boolean;
};

export type SiteSubscriptionPage = {
	subscriptions: SiteSubscriptionsResponseItem[];
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
	is_wpforteams_site: boolean;
	is_paid_subscription: boolean;
	organization_id: number;
	post_id: number;
	post_title: string;
	post_excerpt: string;
	post_url: string;
	notification: {
		send_comments: boolean;
	};
};

export type PostSubscriptionsResult = {
	pageParams: [];
	pages: {
		comment_subscriptions: PostSubscription[];
		total_comment_subscriptions_count: number;
	}[];
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

export type SiteSubscriptionDetails< DateT = Date > = {
	ID: number;
	blog_ID: number;
	feed_ID: number;
	name: string;
	URL: string;
	site_icon: string | null;
	date_subscribed: DateT;
	subscriber_count: number;
	delivery_methods: SiteSubscriptionDeliveryMethods;
	payment_details: SiteSubscriptionPaymentDetails[];
};

export type SiteSubscriptionPaymentDetails = {
	is_gift: boolean;
	ID: string;
	site_id: string;
	status: string;
	start_date: string;
	end_date: string;
	renew_interval: string;
	renewal_price: string;
	currency: string;
	product_id: string;
	title: string;
};

export type ErrorResponse< Errors = unknown, ErrorData = unknown > = {
	errors: Errors;
	error_data: ErrorData;
};

export type SiteSubscriptionDetailsErrorResponse = ErrorResponse<
	{
		invalid_blog?: string[];
		invalid_user?: string[];
		subscription_not_found?: string[];
		unauthorized?: string[];
	},
	{
		invalid_blog?: { status: 404 };
		invalid_user?: { status: 403 };
		subscription_not_found?: { status: 404 };
		unauthorized?: { status: 401 };
	}
>;

export type SiteSubscriptionDetailsResponse< DateT = Date > =
	| SiteSubscriptionDetails< DateT >
	| SiteSubscriptionDetailsErrorResponse;
