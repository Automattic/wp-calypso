import { recordOrder } from 'calypso/lib/analytics/ad-tracking';
import { costToUSD } from 'calypso/lib/analytics/utils';
import { gaRecordEvent } from './ga';

export function recordPurchase( { cart, orderId, sitePlanSlug } ) {
	if ( cart.total_cost >= 0.01 ) {
		const usdValue = costToUSD( cart.total_cost, cart.currency );

		// Google Analytics
		gaRecordEvent(
			'Purchase',
			'calypso_checkout_payment_success',
			'',
			usdValue ? usdValue : undefined
		);

		// Marketing
		recordOrder( cart, orderId, sitePlanSlug );
	}
}
