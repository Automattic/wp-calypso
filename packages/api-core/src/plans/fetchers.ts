import { toNumber } from '../normalize-utils';
import { wpcom } from '../wpcom-fetcher';
import type { PlanProduct, PlansDetailsResponse, SiteSpecificPlanProduct } from './types';

/**
 * Normalizes a PlanProduct object to ensure all number fields are actual numbers.
 */
function normalizePlanProduct( plan: PlanProduct ): PlanProduct {
	return {
		...plan,
		product_id: toNumber( plan.product_id ),
		multi: toNumber( plan.multi ),
		blog_id: toNumber( plan.blog_id ),
		bundle_product_ids: plan.bundle_product_ids.map( ( id ) => toNumber( id ) ),
		bill_period: toNumber( plan.bill_period ),
		orig_cost_integer: toNumber( plan.orig_cost_integer ),
		orig_cost: toNumber( plan.orig_cost ),
		cost: toNumber( plan.cost ),
		raw_price_integer: toNumber( plan.raw_price_integer ),
		raw_price: toNumber( plan.raw_price ),
		...( plan.introductory_offer_raw_price !== undefined && {
			introductory_offer_raw_price: toNumber( plan.introductory_offer_raw_price ),
		} ),
		...( plan.introductory_offer_raw_price_integer !== undefined && {
			introductory_offer_raw_price_integer: toNumber( plan.introductory_offer_raw_price_integer ),
		} ),
		...( plan.introductory_offer_interval_count !== undefined && {
			introductory_offer_interval_count: toNumber( plan.introductory_offer_interval_count ),
		} ),
	};
}

/**
 * Normalizes a SiteSpecificPlanProduct object to ensure all number fields are actual numbers.
 */
function normalizeSiteSpecificPlanProduct(
	plan: SiteSpecificPlanProduct
): SiteSpecificPlanProduct {
	return {
		...plan,
		original_price: {
			...plan.original_price,
			amount: toNumber( plan.original_price.amount ),
		},
		raw_price: toNumber( plan.raw_price ),
		raw_price_integer: toNumber( plan.raw_price_integer ),
		raw_discount: toNumber( plan.raw_discount ),
		raw_discount_integer: toNumber( plan.raw_discount_integer ),
		product_id: toNumber( plan.product_id ),
		...( plan.interval !== undefined && {
			interval: toNumber( plan.interval ),
		} ),
		cost_overrides: plan.cost_overrides.map( ( override ) => ( {
			...override,
			old_price: toNumber( override.old_price ),
			new_price: toNumber( override.new_price ),
			percentage: toNumber( override.percentage ),
		} ) ),
		...( plan.introductory_offer_raw_price !== undefined && {
			introductory_offer_raw_price: toNumber( plan.introductory_offer_raw_price ),
		} ),
		...( plan.introductory_offer_raw_price_integer !== undefined && {
			introductory_offer_raw_price_integer: toNumber( plan.introductory_offer_raw_price_integer ),
		} ),
		...( plan.introductory_offer_interval_count !== undefined && {
			introductory_offer_interval_count: toNumber( plan.introductory_offer_interval_count ),
		} ),
		...( plan.id !== undefined && {
			id: toNumber( plan.id ),
		} ),
	};
}

export async function fetchPlans( params: URLSearchParams ): Promise< PlanProduct[] > {
	const plans: PlanProduct[] = await wpcom.req.get( {
		path: '/plans',
		apiVersion: '1.5',
		query: params.toString(),
	} );
	return plans.map( normalizePlanProduct );
}

export async function fetchPricedSitePlans(
	coupon: string | undefined,
	siteId: number
): Promise< SiteSpecificPlanProduct[] > {
	const params = new URLSearchParams();
	coupon && params.append( 'coupon_code', coupon );
	const plansByProductId: Record< string, SiteSpecificPlanProduct > = await wpcom.req.get( {
		path: `/sites/${ encodeURIComponent( siteId ) }/plans`,
		apiVersion: '1.3',
		query: params.toString(),
	} );
	return Object.values( plansByProductId ).map( normalizeSiteSpecificPlanProduct );
}

export async function fetchPlansDetails(): Promise< PlansDetailsResponse > {
	return await wpcom.req.get( {
		path: '/plans/details',
		apiNamespace: 'wpcom/v2',
	} );
}
