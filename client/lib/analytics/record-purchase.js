import { recordOrder } from 'calypso/lib/analytics/ad-tracking';
import { costToUSD } from 'calypso/lib/analytics/utils';
import { hasTransferProduct } from '../cart-values/cart-items';
import { debug, TRACKING_IDS } from './ad-tracking/constants';
import { gaRecordEvent } from './ga';
import { mayWeTrackByTracker } from './tracker-buckets';

export async function recordPurchase( { cart, orderId, sitePlanSlug } ) {
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

	if ( hasTransferProduct( cart ) && mayWeTrackByTracker( 'googleAds' ) ) {
		const params = [
			'event',
			'conversion',
			{
				send_to: TRACKING_IDS.wpcomGoogleAdsGtagDomainTransferPurchase,
				transaction_id: orderId,
			},
		];
		debug( 'recordOrderInGoogleAds: WPCom Domain Transfer Purchase', params );
		window.gtag( ...params );

		// The page redirect to the domain transfer success page happens too quickly and
		// cancels the conversion event before it's fired. We delay execution by 1 second
		// to ensure that the conversion event is recorded
		return new Promise( ( resolve ) => setTimeout( resolve, 1000 ) );
	}
}
