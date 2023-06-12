export type SubscriberEndpointResponse = {
	per_page: number;
	total: number;
	page: number;
	pages: number;
	subscribers: Subscriber[];
};

export type SubscriptionPlan = {
	paid_subscription_id: string;
	status: string;
	title: string;
	currency: string;
	renewal_period: string;
	renewal_price: number;
	start_date: string;
	end_date: string;
};

export type Subscriber = {
	user_id: number;
	subscription_id: number;
	date_subscribed: string;
	email_address: string;
	avatar: string;
	display_name: string;
	plans?: SubscriptionPlan[];
	openRate?: number;
};
