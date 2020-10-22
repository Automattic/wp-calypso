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
	end_date?: string;
	product_id: string;
	renew_interval?: null;
	renewal_price: string;
	site_id: string;
	site_title: string;
	site_url: string;
	start_date: string;
	status: string;
	title: string;
}
