import { refreshCountryCodeCookieGdpr } from 'calypso/lib/analytics/utils';
import { mayWeTrackByTracker, AdTracker, mayWeTrackByBucket, Bucket } from '../tracker-buckets';
import { debug, TRACKING_IDS } from './constants';
import { recordInCriteo } from './criteo';
import { recordParamsInFloodlightGtag } from './floodlight';
import { loadTrackingScripts } from './load-tracking-scripts';

// Ensure setup has run.
import './setup';

/**
 * Records that an item was added to the cart
 *
 * @param {object} cartItem - The item added to the cart
 * @returns {void}
 */
export async function recordAddToCart( cartItem ) {
	await refreshCountryCodeCookieGdpr();

	if ( ! mayWeTrackByBucket( Bucket.ADVERTISING ) ) {
		debug( 'recordAddToCart: [Skipping] ad tracking is not allowed' );
		return;
	}

	await loadTrackingScripts();

	debug( 'recordAddToCart:', cartItem );

	// Google Ads Gtag

	if ( mayWeTrackByTracker( AdTracker.GOOGLE_ADS ) ) {
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

	if ( mayWeTrackByTracker( AdTracker.FACEBOOK ) ) {
		// Fire both WP and JP pixels.

		// WP
		let params = [
			'trackSingle',
			TRACKING_IDS.facebookInit,
			'AddToCart',
			{
				product_slug: cartItem.product_slug,
				free_trial: Boolean( cartItem.free_trial ),
			},
		];
		debug( 'recordAddToCart: [Facebook]', params );
		window.fbq( ...params );

		// Jetpack
		params = [
			'trackSingle',
			TRACKING_IDS.facebookJetpackInit,
			'AddToCart',
			{
				product_slug: cartItem.product_slug,
				free_trial: Boolean( cartItem.free_trial ),
			},
		];
		debug( 'recordAddToCart: [Jetpack]', params );
		window.fbq( ...params );
	}

	// Bing

	if ( mayWeTrackByTracker( AdTracker.BING ) ) {
		const params = {
			ec: 'addtocart',
			el: cartItem.product_slug,
		};
		debug( 'recordAddToCart: [Bing]', params );
		window.uetq.push( params );
	}

	// DCM Floodlight

	if ( mayWeTrackByTracker( AdTracker.FLOODLIGHT ) ) {
		debug( 'recordAddToCart: [Floodlight]' );
		recordParamsInFloodlightGtag( {
			u2: cartItem.product_name,
			send_to: 'DC-6355556/wordp0/addto0+standard',
		} );
	}

	// Criteo

	if ( mayWeTrackByTracker( AdTracker.CRITEO ) ) {
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

	if ( mayWeTrackByTracker( AdTracker.PINTEREST ) ) {
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

	debug( 'recordAddToCart: dataLayer:', JSON.stringify( window.dataLayer, null, 2 ) );
}
