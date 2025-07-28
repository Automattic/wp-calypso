interface ReferralPurchaseAPIResponse {
	status: string;
	product_id: number;
	quantity: number;
	license: {
		license_key: string;
		issued_at: string;
		attached_at: string | null;
		revoked_at: string | null;
	};
	site_assigned: string;
	subscription?: {
		product_name: string;
		purchase_price: number;
		purchase_currency: string;
		billing_interval_unit: string;
	};
}
export interface ReferralPurchase extends ReferralPurchaseAPIResponse {
	status: string;
	referral_id: number;
}
export interface ReferralClient {
	id: number;
	email: string;
}
export interface Referral {
	id: number;
	client: ReferralClient;
	purchases: ReferralPurchase[];
	purchaseStatuses: string[];
	referralStatuses: string[];
	referrals: ReferralAPIResponse[];
}

export interface ReferralAPIResponse {
	id: number;
	client: ReferralClient;
	products: ReferralPurchase[];
	status: string;
}
