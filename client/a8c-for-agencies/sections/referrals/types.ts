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
}
export interface Referral {
	id: number;
	client: {
		id: number;
		email: string;
	};
	purchases: ReferralPurchase[];
	commissions: number;
	statuses: string[];
}

export interface ReferralAPIResponse {
	id: number;
	client: {
		id: number;
		email: string;
	};
	products: ReferralPurchaseAPIResponse[];
	commission: number;
	status: string;
}
