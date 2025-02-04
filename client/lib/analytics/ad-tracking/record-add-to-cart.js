import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import { refreshCountryCodeCookieGdpr } from 'calypso/lib/analytics/utils';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import { mayWeTrackByTracker } from '../tracker-buckets';
import { debug, TRACKING_IDS } from './constants';
import { recordInCriteo } from './criteo';
import { circularReferenceSafeJSONStringify } from './debug';
import { recordParamsInFloodlightGtag } from './floodlight';
import { loadTrackingScripts } from './load-tracking-scripts';

// Ensure setup has run.
import './setup';

/**
 * Records that an item was added to the cart
 * @param {Object} cartItem - The item added to the cart
 * @returns {void}
 */
export async function recordAddToCart( cartItem ) {
	await refreshCountryCodeCookieGdpr();

	await loadTrackingScripts();

	debug( 'recordAddToCart:', cartItem );

	// Google Ads Gtag

	if ( mayWeTrackByTracker( 'googleAds' ) ) {
		const params = [
			'event',
			'conversion',
			{
				send_to: TRACKING_IDS.wpcomGoogleAdsGtagAddToCart,
			},
		];
		debug( 'recordAddToCart: [Google Ads Gtag] WPCom', params );
		window.gtag( ...params );
	}

	// Facebook

	if ( mayWeTrackByTracker( 'facebook' ) ) {
		// Fire both WP and JP pixels.

		// WP
		let params = [
			'trackSingle',
			TRACKING_IDS.facebookInit,
			'AddToCart',
			{
				product_slug: cartItem.product_slug,
			},
		];
		debug( 'recordAddToCart: [Facebook]', params );
		window.fbq( ...params );

		// Jetpack
		if ( isJetpackCheckout() ) {
			params = [
				'trackSingle',
				TRACKING_IDS.facebookJetpackInit,
				'AddToCart',
				{
					product_slug: cartItem.product_slug,
				},
			];
			debug( 'recordAddToCart: [Jetpack]', params );
			window.fbq( ...params );
		}

		// Akismet
		if ( isAkismetCheckout() ) {
			params = [
				'trackSingle',
				TRACKING_IDS.facebookAkismetInit,
				'AddToCart',
				{
					product_slug: cartItem.product_slug,
				},
			];
			debug( 'recordAddToCart: [Akismet]', params );
			window.fbq( ...params );
		}
	}

	// Bing

	if ( mayWeTrackByTracker( 'bing' ) ) {
		const params = {
			ec: 'addtocart',
			el: cartItem.product_slug,
		};
		debug( 'recordAddToCart: [Bing]', params );
		window.uetq.push( params );
	}

	// DCM Floodlight

	if ( mayWeTrackByTracker( 'floodlight' ) ) {
		debug( 'recordAddToCart: [Floodlight]' );
		recordParamsInFloodlightGtag( {
			u2: cartItem.product_name,
			send_to: 'DC-6355556/wordp0/addto0+standard',
		} );
	}

	// Criteo

	if ( mayWeTrackByTracker( 'criteo' ) ) {
		const params = [
			'viewItem',
			{
				item: cartItem.product_id,
			},
		];
		debug( 'recordAddToCart: [Criteo]', params );
		recordInCriteo( ...params );
	}

	// Pinterest

	if ( mayWeTrackByTracker( 'pinterest' ) ) {
		const params = [
			'track',
			'addtocart',
			{
				value: cartItem.cost,
				currency: cartItem.currency,
				line_items: [
					{
						product_name: cartItem.product_name,
						product_id: cartItem.product_slug,
					},
				],
			},
		];
		debug( 'recordAddToCart: [Pinterest]', params );
		window.pintrk( ...params );
	}

	debug( 'recordAddToCart: dataLayer:', circularReferenceSafeJSONStringify( window.dataLayer, 2 ) );
}
