// TODO: complete
export interface Purchase {
	id: number;
	saleAmount?: number;
	amount: number;
	meta?: string;
	isDomainRegistration?: boolean;
	productName: string;
	currencyCode: string;
	expiryDate: string;
	renewDate: string;
	mostRecentRenewDate?: string;
	productSlug: string;
	siteId: number;
	subscribedDate: string;
}

export interface MembershipSubscription {
	ID: string;
	currency: string;
	end_date: string | null;
	product_id: string;
	renew_interval: string | null;
	renewal_price: string;
	site_id: string;
	site_title: string;
	site_url: string;
	start_date: string;
	status: string;
	title: string;
}

export interface MembershipSubscriptionsSite {
	id: string;
	name: string;
	domain: string;
	subscriptions: MembershipSubscription[];
}
