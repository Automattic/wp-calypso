export interface ReferralProduct {
	status: string;
	product_id: number;
	quantity: number;
	license: {
		license_key: string;
	};
	subscription?: {
		id: string;
		product_name: string;
		purchase_price?: string;
		purchase_currency?: string;
		billing_interval_unit?: string;
		status: string;
		subscribed_date?: string;
		expiry?: string;
		auto_renew: boolean;
		renew_date?: string;
		is_refundable?: boolean;
	};
	site_assigned: string;
}

export interface SubscriptionAPIResponse {
	id: number;
	products: ReferralProduct[];
	status: string;
}

export interface Subscription extends ReferralProduct {
	id: number;
	status: string;
	referral_id: number;
}
