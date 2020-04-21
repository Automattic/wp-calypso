/**
 * Internal dependencies
 */
import { costToUSD } from 'lib/analytics/utils';

import { recordOrder } from 'lib/analytics/ad-tracking';
import { gaRecordEvent } from './ga';

export function recordPurchase( { cart, orderId } ) {
	if ( cart.total_cost >= 0.01 ) {
		// Google Analytics
		const usdValue = costToUSD( cart.total_cost, cart.currency );
		gaRecordEvent(
			'Purchase',
			'calypso_checkout_payment_success',
			'',
			usdValue ? usdValue : undefined
		);
		// Marketing
		recordOrder( cart, orderId );
	}
}
