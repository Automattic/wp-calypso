export interface BlockAttributes {
	defaultProductSlug: string;
	productSlug: string;
	domain: string;
}

/**
 * This type describes the structure of the pricing plan data returned from the backend API endpoint
 */
export interface ApiPricingPlan {
	path_slug: string;
	raw_price: number;
	bill_period: number;
	product_slug: string;
	currency_code: 'EUR' | 'USD' | 'GBP';
}

declare global {
	interface Window {
		A8C_HAPPY_BLOCKS_CONFIG: {
			domain: string;
			locale: string;
		};
	}
}
