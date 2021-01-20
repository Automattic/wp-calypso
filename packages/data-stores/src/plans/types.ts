/**
 * Internal dependencies
 */
import type { plansProductSlugs, plansOrder, plansPaths } from './constants';

export type StorePlanSlug = typeof plansProductSlugs[ number ];
export type PlanSlug = typeof plansOrder[ number ];
export type PlanPath = typeof plansPaths[ number ];

export type PlanAction = {
	type: string;
	slug?: string;
};
export interface Plan {
	title: string;
	description: string;
	features: string[];
	isPopular?: boolean;
	isFree?: boolean;
	featuresSlugs?: Record< string, boolean >;
	storage?: string;
	periodAgnosticSlug: PlanSlug;
	productIds: number[];
}

export interface PlanProduct {
	billingPeriod: 'MONTHLY' | 'ANNUALLY';
	price: string;
	rawPrice: number;
	productId: number;
	storeSlug: StorePlanSlug;
	annualDiscount?: number;
	periodAgnosticSlug: PlanSlug;
	pathSlug: PlanPath;
	/** Useful for two cases:
	 * 1) to show how much we bill the users for annual plans ($8/mo billed $96)
	 * 2) to show how much a monthly plan would cost in a year (billed 12$/mo costs $144/yr)
	 *  */
	annualPrice: string;
}

/**
 * types of an item from https://public-api.wordpress.com/rest/v1.5/plans response
 * can be super useful later
 */
export interface PricedAPIPlan {
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
	path_slug: PlanPath;
	product_slug: StorePlanSlug;
	description: string;
	cost: number;
	bill_period: 31 | 365;
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

export type PlanFeature = {
	id?: string;
	description?: string;
	name: string;
	requiresAnnuallyBilledPlan: boolean;
	type?: string;
	data?: Array< boolean | string >;
};
export interface APIPlanDetail {
	support_priority: number;
	support_name: string;
	groups: string[];
	products: [
		{
			plan_id: number;
		}
	];
	name: string;
	short_name: string;
	nonlocalized_short_name: PlanSlug;
	tagline: string;
	description: string;
	features: string[];
	highlighted_features: string[];
	storage: string;
	icon: string;
}

export interface FeaturesByType {
	id: string;
	name: string;
	features: string[];
}

export interface Feature {
	id: string;
	name: string;
	description: string;
	type: string;
}

export interface DetailsAPIResponse {
	plans: APIPlanDetail[];
	features_by_type: FeaturesByType[];
	features: Feature[];
}
