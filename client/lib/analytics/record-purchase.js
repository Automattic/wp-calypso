/**
 * Internal dependencies
 */
import { costToUSD } from 'calypso/lib/analytics/utils';
import { recordOrder } from 'calypso/lib/analytics/ad-tracking';
import { recordFullStoryEvent } from 'calypso/lib/analytics/fullstory';
import { gaRecordEvent } from './ga';

export function recordPurchase( { cart, orderId } ) {
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
		recordOrder( cart, orderId );

		// FullStory
		if ( ! cart.is_signup ) {
			recordFullStoryEvent( 'calypso_checkout_payment_success', {
				order_id: orderId,
				usd_value: usdValue,
				value: cart.total_cost,
				currency: cart.currency,
				product_slugs: cart.products.map( ( product ) => product.product_slug ).join( ',' ),
				product_names: cart.products.map( ( product ) => product.product_name ).join( ',' ),
			} );
		}
	}
}
