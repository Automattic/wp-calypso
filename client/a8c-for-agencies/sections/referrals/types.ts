export interface ReferralPurchase {
	license_id: number;
	quantity: number;
	product_id: number;
}
export interface Referral {
	id: number;
	client_id: number;
	client_email: string;
	purchases: ReferralPurchase[];
	commissions: number;
	statuses: string[];
}

export interface ReferralAPIResponse {
	id: number;
	client_id: number;
	client_email: string;
	products: {
		license_id: number;
		quantity: number;
		product_id: number;
	}[];
	commission: number;
	status: string;
}
