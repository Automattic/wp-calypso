/**
 * Internal dependencies
 */
import type { PLANS_LIST } from './plans-data';

export type PlanSlug = keyof typeof PLANS_LIST;

export type PlanAction = {
	type: string;
	slug?: string;
};

export interface Plan {
	title: string;
	productId: number;
	storeSlug: PlanSlug;
	pathSlug: string;
	features: string[];
	isPopular?: boolean;
	isFree?: boolean;
}

/**
 * types of an item from https://public-api.wordpress.com/rest/v1.5/plans response
 * can be super useful later
 */
export interface APIPlan {
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
	tagline: object;
	currency_code: string;
}
