import { SubscribersFilterBy, SubscribersSortBy } from '../constants';

export type SubscriberEndpointResponse = {
	per_page: number;
	total: number;
	page: number;
	pages: number;
	subscribers: Subscriber[];
	is_owner_subscribed: boolean;
};

export type SubscriptionPlan = {
	is_gift: boolean;
	gift_id: number;
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
	user_id: number;
	subscription_id: number;
	date_subscribed: string;
	is_email_subscriber: boolean;
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

export type SubscriberListArgs = {
	currentPage: number;
	perPage?: number;
	filterOption?: SubscribersFilterBy;
	searchTerm?: string;
	sortTerm?: SubscribersSortBy;
};

export type SubscriberStats = {
	emails_sent: number;
	unique_opens: number;
	unique_clicks: number;
	blog_registration_date: Date;
};
