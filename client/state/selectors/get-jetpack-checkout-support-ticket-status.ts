import 'calypso/state/data-layer/wpcom/jetpack-checkout/support-ticket';

import type { AppState } from 'calypso/types';

/**
 * Returns the response status of the post-purchase Zendesk ticket.
 * Returns false if the receipt ID is unknown, or there is no information yet.
 *
 * @param  {Object}    state       Global state tree
 * @param  {number}    receiptId   The ID of the receipt link to the Zendesk support ticket
 * @returns {string}	           The response status, will be 'pending', or 'success', or 'failed' or false
 */
export default function getJetpackCheckoutSupportTicketStatus(
	state: AppState,
	receiptId: number
): string {
	return state.jetpackCheckout?.requestStatus?.[ receiptId ];
}
