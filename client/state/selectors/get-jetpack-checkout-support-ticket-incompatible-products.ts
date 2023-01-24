import 'calypso/state/data-layer/wpcom/jetpack-checkout/support-ticket';

import type { AppState } from 'calypso/types';

/**
 * Returns the product ID's of the site's subscriptions that are incompatible with
 * the subscription that could not be transferred.
 *
 * @param  {Object}    state     Global state tree
 * @param  {number}    siteId    The ID of the temporary site
 * @returns {Array} The response body containing  incompatible_product_ids: []
 */
export default function getJetpackCheckoutIncompatibleProductIds(
	state: AppState,
	siteId: number
): number[] {
	return state.jetpackCheckout?.submittedSiteUrl?.[ siteId ]?.incompatible_product_ids || [];
}
