import { toNumber } from '../normalize-utils';
import { wpcom } from '../wpcom-fetcher';
import type { SiteContextualPlan } from './types';

/**
 * Normalizes a product object to ensure all number fields are actual numbers.
 */
function normalizeSitePlan( plan: SiteContextualPlan ): SiteContextualPlan {
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

export async function fetchSitePlans(
	siteId: number,
	coupon?: string
): Promise< SiteContextualPlan[] > {
	const params = new URLSearchParams();
	coupon && params.append( 'coupon_code', coupon );
	const plansByProductId: Record< string, SiteContextualPlan > = await wpcom.req.get( {
		path: `/sites/${ siteId }/plans`,
		apiVersion: '1.3',
		query: params.toString(),
	} );
	return Object.values( plansByProductId ).map( normalizeSitePlan );
}
