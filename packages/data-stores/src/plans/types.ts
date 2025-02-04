import { PERIOD_LIST } from './constants';
import * as selectors from './selectors';
import type { plansProductSlugs, plansSlugs } from './constants';
import type { SelectFromMap } from '../mapped-types';
import type { PlanSlug as PlanSlugFromProducts } from '@automattic/calypso-products';

export type StorePlanSlug = ( typeof plansProductSlugs )[ number ];
export type PlanSlug = ( typeof plansSlugs )[ number ];

/**
 * at the moment possible plan paths are identical with plan slugs
 *
 * Update 2024/07/10:
 *   - it looks like the above is no longer the reality
 *   - the type should either be removed (widened to string) or compiled to a list of all possible paths
 */
export type PlanPath = PlanSlug;

export type PlanBillingPeriod = 'MONTHLY' | 'ANNUALLY';
export type PlanNonlocalizedShortName =
	| 'Free'
	| 'Personal'
	| 'Premium'
	| 'Business'
	| 'eCommerce'
	| 'Starter'
	| 'Explorer'
	| 'Creator'
	| 'Entrepreneur';

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
	pathSlug?: string;
	/**
	 * Useful for two cases:
	 * 1) to show how much we bill the users for annual plans ($8/mo billed $96)
	 * 2) to show how much a monthly plan would cost in a year (billed 12$/mo costs $144/yr)
	 */
	annualPrice: string;
}

export interface PlanIntroductoryOffer {
	/**
	 * @deprecated use `formatCurrency` call instead on the respective price (monthly/full)
	 */
	formattedPrice: string;
	rawPrice: {
		monthly: number;
		full: number;
	};
	/**
	 * IMPORTANT:
	 * we make the raw assumption that the interval unit is either "year" or "month"
	 * to compute monthly/full price
	 */
	intervalUnit: string;
	intervalCount: number;
	isOfferComplete: boolean;
}

export interface CostOverride {
	doesOverrideOriginalCost: boolean;
	firstUnitOnly: boolean;
	newPrice: number;
	oldPrice: number;
	overrideCode: string;
	percentage: number;
}

export interface PlanPricing {
	billPeriod: -1 | ( typeof PERIOD_LIST )[ number ];
	currencyCode: string;
	introOffer?: PlanIntroductoryOffer | null;
	/**
	 * This is the original cost as defined for the associated billing plan.
	 */
	originalPrice: {
		monthly: number | null;
		full: number | null;
	};
	/**
	 * This is the original cost as defined for the associated billing plan, minus any discounts
	 * stemming from either currency conversion and/or prorated credits (in the case of Site Plans).
	 *   1. If a concrete value exists for `Plan` (derived from `usePlans`),
	 * then it refers to a technical discount due to currency conversion.
	 *   2. If a concrete value exists for `SitePlan` (derived from `useSitePlans`),
	 * then it refers to a credit-based discount on the plan price (e.g. from proration).
	 */
	discountedPrice: {
		monthly: number | null;
		full: number | null;
	};
}

export interface SitePlanPricing extends Omit< PlanPricing, 'billPeriod' > {
	hasSaleCoupon?: boolean;
	costOverrides?: CostOverride[];
}

/**
 * `PricingMetaForGridPlan` should be adjusted to extend `PlanPricing`, or modify `PlanPricing` to have a single pricing interface.
 * - optional/required properties should be the same
 * - types should be the same
 * - naming inconsistencies (billingPeriod -> billPeriod)
 * - `expiry` missing in `PlanPricing`
 */
export interface PricingMetaForGridPlan {
	billingPeriod?: PlanPricing[ 'billPeriod' ];
	currencyCode?: PlanPricing[ 'currencyCode' ];
	originalPrice: PlanPricing[ 'originalPrice' ];
	/**
	 * If discounted prices are provided (not null), they will take precedence over originalPrice.
	 * UI will show original with a strikethrough or grayed out
	 */
	discountedPrice: PlanPricing[ 'discountedPrice' ];
	/**
	 * Intro offers override billing and pricing shown in the UI
	 * they are currently defined off the site plans (so not defined when siteId is not available)
	 */
	introOffer?: PlanPricing[ 'introOffer' ];
	expiry?: SitePlan[ 'expiry' ];
}

export interface SitePlan {
	/* START: Same SitePlan/PlanNext props */
	planSlug: PlanSlugFromProducts;
	productSlug: PlanSlugFromProducts;
	productId: number;
	pricing: SitePlanPricing;
	/* END: Same SitePlan/PlanNext props */
	currentPlan?: boolean;
	hasRedeemedDomainCredit?: boolean;
	/**
	 * This value is only returned for the current plan on the site.
	 * It is only available from site plans and is the expiry date of an existing plan.
	 */
	expiry?: string;
	/**
	 * This is only set when `currentPlan` is true (so for the current plan on the site).
	 * It is sent through as `id` from the endpoint and remapped here to avoid confusion e.g. with `productId`.
	 */
	purchaseId?: number;
}

/**
 * This is the new interface for API Plans that will replace the existing Plan interface above.
 * The existing Plan interface will be removed once this interface is fully implemented.
 */
export interface PlanNext {
	/* START: Same SitePlan/PlanNext props */
	planSlug: PlanSlugFromProducts;
	productSlug: PlanSlugFromProducts;
	productId: number;
	pricing: PlanPricing;
	/* END: Same SitePlan/PlanNext props */
	productNameShort: string;
	pathSlug?: string;
}

export interface PricedAPIPlanIntroductoryOffer {
	/**
	 * @deprecated use `formatCurrency` call instead on the respective price (monthly/full)
	 * - no need to pass this from the API at all
	 */
	introductory_offer_formatted_price?: string;
	introductory_offer_raw_price_integer?: number;
	/**
	 * IMPORTANT:
	 * we make the raw assumption that the interval unit is either "year" or "month"
	 * to compute monthly/full price
	 */
	introductory_offer_interval_unit?: string;
	introductory_offer_interval_count?: number;
	introductory_offer_end_date?: string;
}

export interface PricedAPISitePlanCostOverride {
	does_override_original_cost: boolean;
	first_unit_only: boolean;
	new_price: number;
	old_price: number;
	override_code: string;
	percentage: number;
}

export interface PricedAPIPlanPricing {
	bill_period: -1 | ( typeof PERIOD_LIST )[ number ];
	product_display_price: string;
	formatted_price: string;

	/**
	 * The product price in the currency's smallest unit.
	 */
	raw_price_integer: number;

	/**
	 * The orig cost in the currency's smallest unit. Note that orig_cost_integer is never null.
	 * If the cost of a store product is overridden by a promotion or a coupon, orig_cost_integer
	 * will return a price identical to raw_price_integer instead.
	 */
	orig_cost_integer: number;

	currency_code: string;
}

export interface PricedAPISitePlanPricing
	extends Omit< PricedAPIPlanPricing, 'orig_cost_integer' | 'bill_period' > {
	raw_discount_integer: number;

	cost_overrides?: PricedAPISitePlanCostOverride[];
}

/**
 * Item returned from https://public-api.wordpress.com/rest/v1.5/plans response
 * Only the properties that are actually used in the store are typed
 */
export interface PricedAPIPlan extends PricedAPIPlanPricing, PricedAPIPlanIntroductoryOffer {
	product_id: number;
	product_name: string;
	path_slug?: string;
	product_slug: StorePlanSlug;
	product_name_short: string;
	product_type?: string;

	/**
	 * The product price as a float.
	 * @deprecated use raw_price_integer as using floats for currency is not safe.
	 */
	raw_price: number;

	/**
	 * The orig cost as a float.
	 * @deprecated use orig_cost_integer as using floats for currency is not safe.
	 */
	orig_cost?: number | null;
}

/**
 * Item returned from https://public-api.wordpress.com/rest/v1.3/sites/[siteId]/plans response
 * Only the properties that are actually used in the store are typed
 * Note: These, unlike the PricedAPIPlan, are returned indexed by product_id (and do not inlcude that in the plan's payload)
 */
export interface PricedAPISitePlan
	extends PricedAPISitePlanPricing,
		PricedAPIPlanIntroductoryOffer {
	has_sale_coupon?: boolean;
	/* product_id: number; // not included in the plan's payload */
	product_slug: StorePlanSlug;
	current_plan?: boolean;
	has_redeemed_domain_credit?: boolean;

	/**
	 * This is the purchase ID present when `current_plan` is true.
	 * For this, we map it (on `SitePlan` interface) as `purchaseId` instead
	 * of `id` to avoid confusion e.g. with `productId`.
	 */
	id?: string;

	/**
	 * This value is only returned for the current plan on the site
	 */
	expiry?: string;
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
	path_slug: string;
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
