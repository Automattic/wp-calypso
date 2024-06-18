interface ReferralPurchaseAPIResponse {
	license_id: number;
	quantity: number;
	product_id: number;
	date_assigned: string;
	site_assigned: string;
	license_key: string;
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
	id: string;
	client: ReferralClient;
	purchases: ReferralPurchase[];
	commissions: number;
	statuses: string[];
}

export interface ReferralAPIResponse {
	id: number;
	client: ReferralClient;
	products: ReferralPurchaseAPIResponse[];
	commission: number;
	status: string;
}
