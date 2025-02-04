export interface BlockAttributes {
	defaultProductSlug: string;
	productSlug: string;
	domain: string | false;
	affiliateLink: string | false;
	planTypeOptions: string[];
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
	product_name_short: string;
	product_name: string;
}

declare global {
	interface Window {
		A8C_HAPPY_BLOCKS_CONFIG: {
			locale: string;
			features: Record< string, boolean >;
		};
	}
}
