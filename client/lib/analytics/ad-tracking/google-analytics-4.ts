import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { GaPurchase } from '../utils/cart-to-ga-purchase';
import { GaItem } from '../utils/product-to-ga-item';
import { TRACKING_IDS } from './constants';

// Ensure setup has run.
import './setup';

export enum Ga4PropertyGtag {
	JETPACK,
	WPCOM,
}

export const ga4Properties: { [ env in Ga4PropertyGtag ]: string } = {
	[ Ga4PropertyGtag.WPCOM ]: TRACKING_IDS.wpcomGoogleGA4Gtag,
	[ Ga4PropertyGtag.JETPACK ]: TRACKING_IDS.jetpackGoogleGA4Gtag,
};

export function setup( params: Gtag.ConfigParams ) {
	window.gtag( 'config', TRACKING_IDS.wpcomGoogleGA4Gtag, params );

	if ( isJetpackCloud() ) {
		window.gtag( 'config', TRACKING_IDS.jetpackGoogleGA4Gtag, params );
	}
}

export function fireEcommercePurchase( purchase: GaPurchase, ga4PropertyGtag: Ga4PropertyGtag ) {
	window.gtag( 'event', 'purchase', {
		send_to: Ga4PropertyGtag[ ga4PropertyGtag ],
		...purchase,
	} );
}

export function fireEcommerceAddToCart( item: GaItem, ga4PropertyGtag: Ga4PropertyGtag ) {
	window.gtag( 'event', 'add_to_cart', {
		send_to: Ga4PropertyGtag[ ga4PropertyGtag ],
		value: item.price,
		currency: 'USD',
		items: [ item ],
	} );
}

export function firePageView( title: string, location: string, ga4PropertyGtag: Ga4PropertyGtag ) {
	window.gtag( 'event', 'page_view', {
		send_to: Ga4PropertyGtag[ ga4PropertyGtag ],
		page_title: title,
		page_location: location,
	} );
}
