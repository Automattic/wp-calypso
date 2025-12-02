import type { ProductIntroductoryOffer } from '../products/types.ts';

/**
 * Price tier information
 */
export interface ProductPriceTier {
	minimum_units: number;
	maximum_units: number | null;
	minimum_price: number;
	maximum_price: number | null;
	minimum_price_display: string;
	maximum_price_display: string | null;
	minimum_price_monthly_display: string;
	maximum_price_monthly_display: string | null;
}

/**
 * Sale coupon information
 */
export interface ProductSaleCoupon {
	coupon_code: string;
	discount: number;
	discount_percentage: number;
	// Add other coupon properties as needed
}

/**
 * Individual product object in the response
 */
export interface SiteProduct {
	/** Whether the product is available for purchase */
	available: boolean;

	/** Unique product ID */
	product_id: number;

	/** Human-readable product name */
	product_name: string;

	/** Product slug identifier */
	product_slug: string;

	/** Product type (e.g., 'jetpack', 'plan') */
	product_type: string;

	/** Billing product slug */
	billing_product_slug?: string;

	/** Product description */
	description?: string;

	/** Cost as a number */
	cost: number;

	/** Cost in smallest currency unit (e.g., cents) */
	cost_smallest_unit: number;

	/** Formatted cost string */
	cost_display: string;

	/** Formatted monthly cost string */
	cost_per_month_display?: string;

	/** Combined cost display (e.g., for bundles) */
	combined_cost_display?: string;

	/** Combined sale cost display */
	combined_sale_cost_display?: string;

	/** List of price tiers for variable pricing */
	price_tier_list?: ProductPriceTier[];

	/** Usage quantity for tiered pricing */
	price_tier_usage_quantity?: number;

	/** Product term (e.g., 'month', 'year') */
	product_term?: string;

	/** Localized product term */
	product_term_localized?: string;

	/** Whether this is a domain registration product */
	is_domain_registration?: boolean;

	/** Whether HSTS is required for this domain */
	is_hsts_required?: boolean;

	/** Whether .gay domain notice is required */
	is_dot_gay_notice_required?: boolean;

	/** Whether privacy protection can be purchased */
	is_privacy_protection_product_purchase_allowed?: boolean;

	/** Sale cost if on sale */
	sale_cost?: number;

	/** Sale coupon details */
	sale_coupon?: ProductSaleCoupon;

	/** Currency code (e.g., 'USD', 'EUR') */
	currency_code: string;

	/** Top-level domain for domain products */
	tld?: string;

	/** Introductory offer details */
	introductory_offer?: ProductIntroductoryOffer;

	/** 100-year combined cost display */
	hundred_year_combined_cost_display?: string;

	/** 100-year product term localized */
	hundred_year_product_term_localized?: string;

	/** 100-year combined cost in smallest unit */
	hundred_year_combined_cost_smallest_unit?: number;
}
