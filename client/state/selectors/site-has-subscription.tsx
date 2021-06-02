/**
 * External dependencies
 */
import { getPlan } from '@automattic/calypso-products';

/**
 * Internal dependencies
 */
import { getSiteProducts, getSitePlan } from 'calypso/state/sites/selectors';

/**
 * Type dependencies
 */
import type { AppState } from 'calypso/types';

/**
 * Given an array of product or plan slugs, returns wheter the site has a subscription to any of them.
 *
 * @param   {object}  state  Global state tree
 * @param   {number|null}  siteId ID of the site
 * @param   {string|string[]} subscriptionSlug product and/or plan slugs
 * @returns {boolean}        Whether site has the plan or product subscription
 */
export default function siteHasSubscription(
	state: AppState,
	siteId: number | null,
	subscriptionSlug: string | string[]
): boolean | null {
	const siteProducts = getSiteProducts( state, siteId );
	const sitePlan = getSitePlan( state, siteId );

	if ( ! siteProducts && ! sitePlan ) {
		return null;
	}

	if ( ! Array.isArray( subscriptionSlug ) ) {
		subscriptionSlug = [ subscriptionSlug ];
	}

	let productsList: string[] = [];
	if ( siteProducts ) {
		productsList = siteProducts
			.filter( ( product ) => ! product.expired )
			.map( ( { productSlug } ) => productSlug );
	}
	if ( sitePlan ) {
		const sitePlanDetails = getPlan( sitePlan.product_slug );
		productsList = [
			...productsList,
			...[ sitePlan.product_slug ],
			...sitePlanDetails.getHiddenFeatures(),
			...( sitePlanDetails.getInferiorHiddenFeatures?.() ?? [] ),
		];
	}
	return productsList.some( ( product ) => subscriptionSlug.includes( product ) );
}
