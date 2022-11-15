export interface BlockAttributes {
	planSlug: string;
}

export interface PricingPlanBilling {
	label: string;
	price: string;
	period: string;
	planSlug: string;
	upgradeLink: string;
}

export interface PricingPlan {
	label: string;
	domain: string;
	description: string;
	learnMoreLink: string;
	upgradeLabel: string;
	billing: PricingPlanBilling[];
}

export interface PricingPlansConfiguration {
	premium: PricingPlan;
	business: PricingPlan;
	ecommerce: PricingPlan;
}

/**
 * This type describes the structure of the pricing plan data returned from the backend API endpoint
 */
export interface ApiPricingPlan {
	path_slug: string;
	raw_price: number;
	bill_period: number;
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
