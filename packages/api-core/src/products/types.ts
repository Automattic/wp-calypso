export interface PriceTier {
	minimum_units?: number;
	maximum_units?: number;
	minimum_price?: number;
	maximum_price?: number;
	minimum_price_display?: string;
	minimum_price_monthly_display?: string;
	maximum_price_display?: string;
	maximum_price_monthly_display?: string;
}

export interface Product {
	product_id: number;
	product_name: string;
	product_slug: string;
	description?: string;
	product_type?: string;
	available?: boolean;
	billing_product_slug?: string;
	is_domain_registration?: boolean;
	cost_display?: string;
	combined_cost_display?: string;
	cost?: number;
	cost_smallest_unit?: number | null;
	currency_code?: string;
	price_tier_list?: PriceTier[];
	price_tier_usage_quantity?: number | null;
	product_term?: string;
	product_term_localized?: string;
	price_tiers?: [];
	price_tier_slug?: string;
	cost_per_month_display?: string;
	tld?: string;
	is_privacy_protection_product_purchase_allowed?: boolean;
	introductory_offer?: {
		interval_unit: string;
		interval_count: number;
		usage_limit: number | null;
		cost_per_interval: number;
		transition_after_renewal_count: number;
		should_prorate_when_offer_ends: boolean;
	} | null;
}
