import 'calypso/state/data-layer/wpcom/jetpack-checkout/support-ticket';

import type { AppState } from 'calypso/types';

/**
 * Returns true if we are currently making a request to update the post-purchase Zendesk ticket.
 * Returns false if the receipt ID is unknown, or there is no information yet.
 *
 * @param  {Object}    state       Global state tree
 * @param  {number}    receiptId   The ID of the receipt link to the Zendesk support ticket
 * @returns {boolean}	           Whether the update is in progress
 */
export default function isUpdatingJetpackCheckoutSupportTicket(
	state: AppState,
	receiptId: number
): boolean {
	return state.jetpackCheckout?.requestStatus?.[ receiptId ] === 'pending';
}
