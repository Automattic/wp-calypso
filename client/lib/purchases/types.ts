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
	is_renewable: boolean;
}

export interface Owner {
	ID: number;
	display_name?: string;
}

export type GetManagePurchaseUrlFor = (
	siteSlug: string,
	attachedToPurchaseId: string | number
) => string;
