export interface ReferralProduct {
	status: string;
	product_id: number;
	quantity: number;
	license: {
		license_key: string;
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
