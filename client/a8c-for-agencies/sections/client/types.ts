export interface ReferralProduct {
	date_assigned: string;
	license_id: number;
	license_key: string;
	product_id: number;
	quantity: number;
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
