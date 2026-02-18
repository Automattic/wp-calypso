import { getCurrencyObject } from '@automattic/number-formatters';
import { recordOrder } from 'calypso/lib/analytics/ad-tracking';
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
	if ( cart.total_cost_usd_integer >= 1 ) {
		// Google Analytics
		gaRecordEvent(
			'Purchase',
			'calypso_checkout_payment_success',
			'',
			getCurrencyObject( cart.total_cost_usd_integer, 'USD', { isSmallestUnit: true } ).floatValue
		);

		// Marketing
		recordOrder( cart, orderId, sitePlanSlug );
	}
}
