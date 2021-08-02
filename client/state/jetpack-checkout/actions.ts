/**
 * Internal dependencies
 */
import { JETPACK_CHECKOUT_UPDATE_SUPPORT_TICKET_REQUEST } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/jetpack-checkout/support-ticket';
import 'calypso/state/jetpack-checkout/init';

interface UpdateJetpackCheckoutSupportTicketActionType {
	type: typeof JETPACK_CHECKOUT_UPDATE_SUPPORT_TICKET_REQUEST;
	siteUrl: string;
	receiptId: number;
	source?: string;
}

export function requestUpdateJetpackCheckoutSupportTicket(
	siteUrl: string,
	receiptId: number,
	source: string
): UpdateJetpackCheckoutSupportTicketActionType {
	return {
		type: JETPACK_CHECKOUT_UPDATE_SUPPORT_TICKET_REQUEST,
		siteUrl,
		receiptId,
		source,
	};
}
