interface Product {
	date_assigned: string;
	license_id: number;
	license_key: string;
	product_id: number;
	quantity: number;
	site_assigned: string;
}

export interface SubscriptionAPIResponse {
	id: number;
	products: Product[];
	status: string;
}

export interface Subscription extends Product {
	id: number;
	status: string;
	referral_id: number;
}
