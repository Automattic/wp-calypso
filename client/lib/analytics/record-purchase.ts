import { recordOrder } from 'calypso/lib/analytics/ad-tracking';
import { costToUSD } from 'calypso/lib/analytics/utils';
import { gaRecordEvent } from './ga';
import type { ResponseCart } from '@automattic/shopping-cart';

export async function recordPurchase( {
	cart,
	orderId,
	sitePlanSlug,
}: {
	cart: ResponseCart;
	orderId: number | null | undefined;
	sitePlanSlug: string | null | undefined;
} ) {
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
