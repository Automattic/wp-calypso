import { PERIOD_LIST } from './constants';
import * as selectors from './selectors';
import type { plansProductSlugs, plansSlugs } from './constants';
import type { SelectFromMap } from '../mapped-types';
import type { PlanSlug as PlanSlugFromProducts } from '@automattic/calypso-products';

export type StorePlanSlug = ( typeof plansProductSlugs )[ number ];
export type PlanSlug = ( typeof plansSlugs )[ number ];

// at the moment possible plan paths are identical with plan slugs
export type PlanPath = PlanSlug;

export type PlanBillingPeriod = 'MONTHLY' | 'ANNUALLY';
export type PlanNonlocalizedShortName = 'Free' | 'Personal' | 'Premium' | 'Business' | 'eCommerce';

export type PlanAction = {
	type: string;
	slug?: string;
};

export type PlanSimplifiedFeature = {
	name: string;
	requiresAnnuallyBilledPlan: boolean;
};
export interface Plan {
	title: string;
	description: string;
	features: PlanSimplifiedFeature[];
	isPopular?: boolean;
	isFree?: boolean;
	featuresSlugs?: Record< string, boolean >;
	storage?: string;
	periodAgnosticSlug: PlanSlug;
	productIds: number[];
}

export interface PlanProduct {
	billingPeriod: PlanBillingPeriod;
	price: string;
	rawPrice: number;
	productId: number;
	storeSlug: StorePlanSlug;
	annualDiscount?: number;
	periodAgnosticSlug: PlanSlug;
	pathSlug?: PlanPath;
	/**
	 * Useful for two cases:
	 * 1) to show how much we bill the users for annual plans ($8/mo billed $96)
	 * 2) to show how much a monthly plan would cost in a year (billed 12$/mo costs $144/yr)
	 */
	annualPrice: string;
}

export interface PlanIntroductoryOffer {
	formattedPrice: string;
	rawPrice: number;
	intervalUnit: string;
	intervalCount: number;
}

export interface SitePlan {
	planSlug: PlanSlugFromProducts;
	productId: number;
	introOffer?: PlanIntroductoryOffer | null;
}

export interface PricedAPIPlanIntroductoryOffer {
	introductory_offer_formatted_price?: string;
	introductory_offer_raw_price?: number;
	introductory_offer_interval_unit?: string;
	introductory_offer_interval_count?: number;
}

/**
 * Item returned from https://public-api.wordpress.com/rest/v1.5/plans response
 * Only the properties that are actually used in the store are typed
 */
export interface PricedAPIPlan {
	product_id: number;
	product_name: string;
	path_slug?: PlanPath;
	product_slug: StorePlanSlug;
	product_name_short: string;
	product_type?: string;
	bill_period: -1 | ( typeof PERIOD_LIST )[ number ];

	/**
	 * The product price in the currency's smallest unit.
	 */
	raw_price_integer: number;

	/**
	 * The product price as a float.
	 *
	 * @deprecated use raw_price_integer as using floats for currency is not safe.
	 */
	raw_price: number;
	orig_cost?: number | null;
	currency_code: string;
}

/**
 * Item returned from https://public-api.wordpress.com/rest/v1.3/sites/[siteId]/plans response
 * Only the properties that are actually used in the store are typed
 * Note: These, unlike the PricedAPIPlan, are returned indexed by product_id (and do not inlcude that in the plan's payload)
 */
export interface PricedAPISitePlan extends PricedAPIPlanIntroductoryOffer {
	/* product_id: number; not included in the plan's payload */
	product_slug: StorePlanSlug;
}

export interface PricedAPIPlanFree extends PricedAPIPlan {
	product_id: 1;
	cost: 0;
	path_slug: 'free';
	product_slug: 'free_plan';
	bill_period: -1;
	raw_price: 0;
	raw_price_integer: 0;
}
export interface PricedAPIPlanPaidAnnually extends PricedAPIPlan {
	path_slug: PlanPath;
	bill_period: 365;
}
export interface PricedAPIPlanPaidMonthly extends PricedAPIPlan {
	bill_period: 31;
}

export type PlanFeature = {
	id: string;
	description?: string;
	name: string;
	requiresAnnuallyBilledPlan: boolean;
	type?: string;
	data?: Array< boolean | string >;
};

export interface APIPlanDetail {
	nonlocalized_short_name: PlanNonlocalizedShortName;
	tagline: string;
	storage: string;
	short_name: string;
	products: {
		plan_id: number;
	}[];
	highlighted_features: string[];
	features: string[];
}

export interface FeaturesByType {
	id: string;
	name: string | null;
	features: string[];
}

export interface DetailsAPIFeature {
	id: string;
	name: string;
	description: string;
}

export interface Feature extends DetailsAPIFeature {
	// TODO: https://github.com/Automattic/wp-calypso/issues/49991
	type: 'checkbox';
}

export interface DetailsAPIResponse {
	plans: APIPlanDetail[];
	features_by_type: FeaturesByType[];
	features: DetailsAPIFeature[];
}

export type PlansSelect = SelectFromMap< typeof selectors >;
