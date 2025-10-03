export interface MonetizeSubscription {
	ID: string;
	currency: string;
	end_date: string | null;
	product_id: string;
	renew_interval: string | null;
	is_renewable: boolean | null;
	renewal_price: string;
	site_id: string;
	site_title: string;
	site_url: string;
	start_date: string;
	status: string;
	title: string;
}

export interface MonetizeSubscriptionsSite {
	id: string;
	name: string;
	domain: string;
	subscriptions: MonetizeSubscription[];
}

export interface MonetizeSubscriptionStopResponse {
	redirect?: string;
}

export interface MonetizeSubscriptionAutoRenewResponse {
	subscription: MonetizeSubscription;
}
