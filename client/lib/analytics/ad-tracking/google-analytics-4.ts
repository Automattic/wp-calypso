import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { GaPurchase } from '../utils/cart-to-ga-purchase';
import { GaItem } from '../utils/product-to-ga-item';
import { TRACKING_IDS } from './constants';

// Ensure setup has run.
import './setup';

export enum TrackingEnvironment {
	JETPACK,
	WPCOM,
}

export const ga4Properties: { [ env in TrackingEnvironment ]: string } = {
	[ TrackingEnvironment.WPCOM ]: TRACKING_IDS.wpcomGoogleGA4Gtag,
	[ TrackingEnvironment.JETPACK ]: TRACKING_IDS.jetpackGoogleGA4Gtag,
};

export function setup( params: Gtag.ConfigParams ) {
	window.gtag( 'config', TRACKING_IDS.wpcomGoogleGA4Gtag, params );

	if ( isJetpackCloud() ) {
		window.gtag( 'config', TRACKING_IDS.jetpackGoogleGA4Gtag, params );
	}
}

export function fireEcommercePurchase(
	purchase: GaPurchase,
	trackingEnvironment: TrackingEnvironment
) {
	window.gtag( 'event', 'purchase', {
		send_to: ga4Properties[ trackingEnvironment ],
		...purchase,
	} );
}

export function fireJetpackEcommerceAddToCart(
	item: GaItem,
	trackingEnvironment: TrackingEnvironment
) {
	window.gtag( 'event', 'add_to_cart', {
		send_to: ga4Properties[ trackingEnvironment ],
		value: item.price,
		currency: 'USD',
		items: [ item ],
	} );
}

export function firePageView(
	title: string,
	location: string,
	trackingEnvironment: TrackingEnvironment
) {
	window.gtag( 'event', 'page_view', {
		send_to: ga4Properties[ trackingEnvironment ],
		page_title: title,
		page_location: location,
	} );
}
