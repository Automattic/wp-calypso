import { SubscribersFilterBy, SubscribersSortBy } from '../constants';

export type SubscriberEndpointResponse = {
	per_page: number;
	total: number;
	total_unfiltered?: number;
	page: number;
	pages: number;
	subscribers: Subscriber[];
	is_owner_subscribed: boolean;
};

export type SubscriptionPlan = {
	subscription_id?: number;
	is_comp: boolean;
	comp_id?: number;
	/** @deprecated Legacy field from the API — plans with is_gift are filtered out. */
	is_gift?: boolean;
	paid_subscription_id: string;
	status: string;
	title: string;
	currency: string;
	renewal_period: string;
	renewal_price: number;
	renew_interval: string;
	inactive_renew_interval: string;
	start_date: string;
	end_date: string;
};

export type Subscriber = {
	user_id: number | string;
	// Fields for new helper library
	email_subscription_id?: number;
	wpcom_subscription_id?: number;
	wpcom_date_subscribed?: string;
	email_date_subscribed?: string;
	// Fields for old format
	subscription_id?: number;
	date_subscribed?: string;
	// Common fields
	subscription_status: string;
	email_address: string;
	avatar: string;
	display_name: string;
	plans?: SubscriptionPlan[];
	open_rate?: number;
	subscriptions?: string[];
	country?: {
		code: string;
		name: string;
	};
	url?: string;
};

export type SubscriberDetails = Omit< Subscriber, 'date_subscribed' > & {
	date_subscribed: string;
};

export type SubscriberQueryParams = {
	page: number;
	perPage?: number;
	filters?: SubscribersFilterBy[];
	search?: string;
	sortTerm?: SubscribersSortBy;
	sortOrder?: 'asc' | 'desc';
};

export type SubscriberStats = {
	emails_sent: number;
	unique_opens: number;
	unique_clicks: number;
	blog_registration_date: Date;
};
