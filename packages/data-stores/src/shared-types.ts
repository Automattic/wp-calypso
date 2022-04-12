export interface WpcomClientCredentials {
	client_id: string;
	client_secret: string;
}

export interface StoreAddress {
	store_address_1: string;
	store_address_2?: string;
	store_city: string;
	store_postcode: string;
	store_country: string;
}
