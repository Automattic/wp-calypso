/**
 * Internal dependencies
 */
import { PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_ECOMMERCE } from './constants';

export type PlanAction = {
	type: string;
	slug?: string;
};

export interface Product {
	plan_id: number;
}

export type Slug =
	| typeof PLAN_FREE
	| typeof PLAN_PERSONAL
	| typeof PLAN_PREMIUM
	| typeof PLAN_BUSINESS
	| typeof PLAN_ECOMMERCE;

export interface Plan {
	slug: Slug;
	groups: string[];
	products: Product[];
	name: string;
	short_name: 'Free' | 'Personal' | 'Premium' | 'Business' | 'E-commerce';
	tagline: string;
	description: string;
	features: string[];
	icon: string;
}

export type Feature = {
	id: string;
	name: string;
	description: string;
};

/**
 * types of an item from https://public-api.wordpress.com/rest/v1.5/plans response
 * can be super useful later
 */
export interface PricesAPIPlan {
	product_id: number;
	product_name: string;
	meta: object;
	prices: {
		AUD: number;
		BRL: number;
		CAD: number;
		CHF: number;
		CZK: number;
		DKK: number;
		EUR: number;
		GBP: number;
		HKD: number;
		HUF: number;
		IDR: number;
		ILS: number;
		INR: number;
		JPY: number;
		MXN: number;
		NOK: number;
		NZD: number;
		PHP: number;
		PLN: number;
		RUB: number;
		SEK: number;
		SGD: number;
		THB: number;
		TWD: number;
		USD: number;
		TRY: number;
	};
	bundle_product_ids: {
		0: number;
		1: number;
		2: number;
		3: number;
		4: number;
		5: number;
		6: number;
	};
	path_slug: string;
	product_slug: Slug;
	description: string;
	cost: number;
	bill_period: number;
	product_type: string;
	available: string;
	multi: number;
	bd_slug: string;
	bd_variation_slug: string;
	outer_slug: string;
	extra: string;
	capability: string;
	product_name_short: string;
	bill_period_label: string;
	price: string;
	formatted_price: string;
	raw_price: number;
	tagline: object;
	currency_code: string;
}
