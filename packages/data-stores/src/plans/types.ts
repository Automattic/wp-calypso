/**
 * Internal dependencies
 */
import type { plansProductSlugs } from './constants';

export type PlanSlug = typeof plansProductSlugs[ number ];

export type PlanAction = {
	type: string;
	slug?: string;
};

export interface Plan {
	title: string;
	description: string;
	productId: number;
	storeSlug: PlanSlug;
	pathSlug: string;
	features: string[];
	isPopular?: boolean;
	isFree?: boolean;
	featuresSlugs?: Record< string, boolean >;
	storage?: string;
}

/**
 * types of an item from https://public-api.wordpress.com/rest/v1.5/plans response
 * can be super useful later
 */
export interface APIPlan {
	product_id: number;
	product_name: string;
	meta: Record< string, unknown >;
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
	product_slug: string;
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
	tagline: Record< string, unknown >;
	currency_code: string;
}

export type APIPlanProduct = {
	plan_id: number;
};

export type APIPlanDetail = {
	short_name: string;
	tagline: string;
	products: Array< APIPlanProduct >;
	nonlocalized_short_name: string;
	highlighted_features: Array< string >;
	features: Array< string >;
	storage?: string;
};

export type PlanFeature = {
	id?: string;
	description?: string;
	name: string;
	type?: string;
	data?: Array< boolean | string >;
};

export type PlanFeatureType = {
	id: string;
	name: string;
	features: Array< string >;
};
