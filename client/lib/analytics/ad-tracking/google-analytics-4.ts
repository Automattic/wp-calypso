import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { GaPurchase } from '../utils/jetpack-cart-to-ga-purchase';
import { GaItem } from '../utils/jetpack-product-to-ga-item';
import { TRACKING_IDS } from './constants';

// Ensure setup has run.
import './setup';

function setup( params: Gtag.ConfigParams ) {
	window.gtag( 'config', TRACKING_IDS.jetpackGoogleGA4Gtag, params );
}

function fireJetpackEcommercePurchase( purchase: GaPurchase ) {
	window.gtag( 'event', 'purchase', {
		send_to: TRACKING_IDS.jetpackGoogleGA4Gtag,
		...purchase,
	} );
}

function fireJetpackEcommerceAddToCart( item: GaItem ) {
	window.gtag( 'event', 'add_to_cart', {
		send_to: TRACKING_IDS.jetpackGoogleGA4Gtag,
		value: item.price,
		currency: 'USD',
		items: [ item ],
	} );
}

function firePageView( title: string, location: string ) {
	if ( isJetpackCloud() ) {
		window.gtag( 'event', 'page_view', {
			send_to: TRACKING_IDS.jetpackGoogleGA4Gtag,
			page_title: title,
			page_location: location,
		} );
	}
}

export const GA4 = {
	setup,
	fireJetpackEcommercePurchase,
	fireJetpackEcommerceAddToCart,
	firePageView,
};
