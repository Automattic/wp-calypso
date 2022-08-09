import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { GaPurchase } from '../utils/jetpack-cart-to-ga-purchase';
import { GaItem } from '../utils/jetpack-product-to-ga-item';
import { TRACKING_IDS } from './constants';

// Ensure setup has run.
import './setup';

export function setup( params: Gtag.ConfigParams ) {
	window.gtag( 'config', TRACKING_IDS.wpcomGoogleGA4Gtag, params );

	if ( isJetpackCloud() ) {
		window.gtag( 'config', TRACKING_IDS.jetpackGoogleGA4Gtag, params );
	}
}

export function fireJetpackEcommercePurchase( purchase: GaPurchase, shouldSendToJetpack = false ) {
	const send_to = shouldSendToJetpack
		? TRACKING_IDS.jetpackGoogleGA4Gtag
		: TRACKING_IDS.wpcomGoogleGA4Gtag;
	window.gtag( 'event', 'purchase', {
		send_to,
		...purchase,
	} );
}

export function fireJetpackEcommerceAddToCart( item: GaItem, shouldSendToJetpack = false ) {
	const send_to = shouldSendToJetpack
		? TRACKING_IDS.jetpackGoogleGA4Gtag
		: TRACKING_IDS.wpcomGoogleGA4Gtag;
	window.gtag( 'event', 'add_to_cart', {
		send_to,
		value: item.price,
		currency: 'USD',
		items: [ item ],
	} );
}

export function firePageView( title: string, location: string, shouldSendToJetpack = false ) {
	const send_to = shouldSendToJetpack
		? TRACKING_IDS.jetpackGoogleGA4Gtag
		: TRACKING_IDS.wpcomGoogleGA4Gtag;

	window.gtag( 'event', 'page_view', {
		send_to,
		page_title: title,
		page_location: location,
	} );
}
