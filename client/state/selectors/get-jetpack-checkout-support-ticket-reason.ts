import 'calypso/state/data-layer/wpcom/jetpack-checkout/support-ticket';

import type { AppState } from 'calypso/types';

/**
 * Returns the server's explanation of why the subscription could not be transferred
 * because of an incompatible product. The text is in English only.
 * @param  {Object}    state     Global state tree
 * @param  {number}    siteId    The ID of the temporary site
 * @returns {string|undefined} The reason, or undefined when the server sent none
 */
export default function getJetpackCheckoutSupportTicketReason(
	state: AppState,
	siteId: number
): string | undefined {
	return state.jetpackCheckout?.submittedSiteUrl?.[ siteId ]?.reason;
}
