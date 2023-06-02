import 'calypso/state/data-layer/wpcom/jetpack-checkout/support-ticket';

import type { AppState } from 'calypso/types';

/**
 * Return the site ID of the site that the subscription was transferred to, or 0 if
 * the subscription could not be transferred.
 *
 * @param  {Object}    state     Global state tree
 * @param  {number}    siteId    The ID of the temporary site
 * @returns {number} The response body containing the destination site ID
 */
export default function getJetpackCheckoutSupportTicketDestinationSiteId(
	state: AppState,
	siteId: number
): number {
	return state.jetpackCheckout?.submittedSiteUrl?.[ siteId ]?.transferred_to;
}
