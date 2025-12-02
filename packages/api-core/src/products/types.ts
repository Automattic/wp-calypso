import type { PriceTierEntry } from '../upgrades';

export type IntroductoryOfferTimeUnit = 'day' | 'week' | 'month' | 'year';

export interface ProductIntroductoryOffer {
	cost_per_interval: number;
	interval_count: number;
	interval_unit: IntroductoryOfferTimeUnit;
	should_prorate_when_offer_ends: boolean;
	transition_after_renewal_count: number;
	usage_limit: number | null;
}

export interface Product {
	// Core product identification
	available: boolean;
	product_id: number;
	product_name: string;
	product_slug: string;
	product_type: string;
	billing_product_slug: string;
	description: string;

	// Pricing
	cost: number; // Float amount in currency's main unit
	cost_smallest_unit: number; // Integer amount in currency's smallest unit (cents)
	cost_display: string; // Formatted with currency symbol
	combined_cost_display: string; // For domain products
	currency_code: string;

	// Product characteristics
	product_term: string; // e.g., 'year', 'month', 'two years', 'three years'
	product_term_localized: string;

	// Optional pricing displays
	cost_per_month_display?: string; // Only for yearly/multi-year products

	// Tiered pricing (for products with usage-based pricing)
	price_tier_list: PriceTierEntry[];
	price_tier_usage_quantity: number | null;

	// Domain-specific fields (conditional - only for domain products)
	is_domain_registration: boolean;
	tld?: string;
	is_hsts_required?: boolean;
	is_dot_gay_notice_required?: boolean;
	is_privacy_protection_product_purchase_allowed?: boolean;

	// Sale pricing (conditional - only when sale_coupon is valid)
	sale_cost?: number;
	combined_sale_cost_display?: string;
	sale_coupon?: SaleCoupon;

	// Introductory offer (conditional - when product has intro offer)
	introductory_offer?: IntroductoryOffer;

	// Hundred year domain pricing (conditional - when hundred_year_slugs param is provided)
	hundred_year_combined_cost_display?: string;
	hundred_year_product_term_localized?: string;
	hundred_year_combined_cost_smallest_unit?: number;
}

interface IntroductoryOffer {
	interval_unit: string;
	interval_count: number;
	usage_limit: number | null;
	cost_per_interval: number;
	transition_after_renewal_count: number;
	should_prorate_when_offer_ends: boolean;
}

interface SaleCoupon {
	start_date: string;
	expires: string;
	discount: number;
	purchase_types: string[];
	product_ids: number[];
	allowed_for_domain_transfers: boolean;
	allowed_for_renewals: boolean;
	allowed_for_new_purchases: boolean;
	code: string;
	tld_rank: number | null;
}
