export interface Referral {
	id: number;
	client_id: number;
	client_email: string;
	purchases: {
		license_id: number;
		quantity: number;
		product_id: number;
	}[];
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
