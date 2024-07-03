import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { GaPurchase } from '../utils/cart-to-ga-purchase';
import { GaItem } from '../utils/product-to-ga-item';
import { TRACKING_IDS } from './constants';

// Ensure setup has run.
import './setup';

export enum Ga4PropertyGtag {
	JETPACK,
	WPCOM,
	AKISMET,
	A8C_FOR_AGENCIES,
}

export const ga4Properties: { [ env in Ga4PropertyGtag ]: string } = {
	[ Ga4PropertyGtag.WPCOM ]: TRACKING_IDS.wpcomGoogleGA4Gtag,
	[ Ga4PropertyGtag.JETPACK ]: TRACKING_IDS.jetpackGoogleGA4Gtag,
	[ Ga4PropertyGtag.AKISMET ]: TRACKING_IDS.akismetGoogleGA4Gtag,
	[ Ga4PropertyGtag.A8C_FOR_AGENCIES ]: TRACKING_IDS.a8cForAgenciesGA4Gtag,
};

export function setup( params: Gtag.ConfigParams ) {
	window.gtag( 'config', TRACKING_IDS.wpcomGoogleGA4Gtag, params );

	if ( isJetpackCloud() ) {
		window.gtag( 'config', TRACKING_IDS.jetpackGoogleGA4Gtag, params );
	}
	if ( isAkismetCheckout() ) {
		window.gtag( 'config', TRACKING_IDS.akismetGoogleGA4Gtag, params );
	}
	if ( isA8CForAgencies() ) {
		window.gtag( 'config', TRACKING_IDS.a8cForAgenciesGA4Gtag, params );
	}
}

export function fireEcommercePurchase( purchase: GaPurchase, ga4PropertyGtag: Ga4PropertyGtag ) {
	window.gtag( 'event', 'purchase', {
		send_to: ga4Properties[ ga4PropertyGtag ],
		...purchase,
	} );
}

export function fireEcommerceAddToCart( item: GaItem, ga4PropertyGtag: Ga4PropertyGtag ) {
	window.gtag( 'event', 'add_to_cart', {
		send_to: ga4Properties[ ga4PropertyGtag ],
		value: item.price,
		currency: 'USD',
		items: [ item ],
	} );
}

export function firePageView( title: string, location: string, ga4PropertyGtag: Ga4PropertyGtag ) {
	window.gtag( 'event', 'page_view', {
		send_to: ga4Properties[ ga4PropertyGtag ],
		page_title: title,
		page_location: location,
	} );
}
