import { GaPurchase } from '../utils/jetpack-cart-to-ga-purchase';
import { GaItem } from '../utils/jetpack-product-to-ga-item';
import { TRACKING_IDS } from './constants';

// Ensure setup has run.
import './setup';

export function setup( params: Gtag.ConfigParams ) {
	window.gtag( 'config', TRACKING_IDS.jetpackGoogleGA4Gtag, params );
}

export function fireJetpackEcommercePurchase( purchase: GaPurchase ) {
	window.gtag( 'event', 'purchase', {
		send_to: TRACKING_IDS.jetpackGoogleGA4Gtag,
		...purchase,
	} );
}

export function fireJetpackEcommerceAddToCart( item: GaItem ) {
	window.gtag( 'event', 'add_to_cart', {
		send_to: TRACKING_IDS.jetpackGoogleGA4Gtag,
		value: item.price,
		currency: 'USD',
		items: [ item ],
	} );
}

export function firePageView( title: string, location: string, shouldSendToJetpack = false ) {
	if ( shouldSendToJetpack ) {
		window.gtag( 'event', 'page_view', {
			send_to: TRACKING_IDS.jetpackGoogleGA4Gtag,
			page_title: title,
			page_location: location,
		} );
	}
}
