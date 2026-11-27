import 'calypso/state/data-layer/wpcom/jetpack-checkout/support-ticket';

import type { AppState } from 'calypso/types';

/**
 * Returns the code for why the subscription could not be transferred, e.g.
 * `jetpack_pro_lower_limits`. The server only sends it to admins of the target site.
 * @param  {Object}    state     Global state tree
 * @param  {number}    siteId    The ID of the temporary site
 * @returns {string|undefined} The reason code, or undefined when the server sent none
 */
export default function getJetpackCheckoutSupportTicketReasonCode(
	state: AppState,
	siteId: number
): string | undefined {
	return state.jetpackCheckout?.submittedSiteUrl?.[ siteId ]?.reason_code;
}
