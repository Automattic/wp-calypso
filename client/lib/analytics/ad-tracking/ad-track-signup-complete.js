import { getCurrentUser } from '@automattic/calypso-analytics';
import { v4 as uuid } from 'uuid';
import { costToUSD, refreshCountryCodeCookieGdpr } from 'calypso/lib/analytics/utils';
import { mayWeTrackByTracker, AdTracker, mayWeTrackByBucket, Bucket } from '../tracker-buckets';
import { debug, TRACKING_IDS, ICON_MEDIA_SIGNUP_PIXEL_URL } from './constants';
import { recordParamsInFloodlightGtag } from './floodlight';
import { loadTrackingScripts } from './load-tracking-scripts';

// Ensure setup has run.
import './setup';

/**
 * Tracks a signup conversion
 *
 * @param {boolean} isNewUserSite Whether the signup is new user with a new site created
 * @returns {void}
 */
export async function adTrackSignupComplete( { isNewUserSite } ) {
	await refreshCountryCodeCookieGdpr();

	if ( ! mayWeTrackByBucket( Bucket.ADVERTISING ) ) {
		debug( 'adTrackSignupComplete: [Skipping] ad tracking is disallowed' );
		return;
	}

	await loadTrackingScripts();

	// Record all signups up in DCM Floodlight (deprecated Floodlight pixels)
	if ( mayWeTrackByTracker( AdTracker.FLOODLIGHT ) ) {
		debug( 'adTrackSignupComplete: Floodlight:' );
		recordParamsInFloodlightGtag( { send_to: 'DC-6355556/wordp0/signu0+unique' } );
	}

	// Track new user conversions by generating a synthetic cart and treating it like an order.

	if ( ! isNewUserSite ) {
		// only for new users with a new site created
		return;
	}

	const syntheticCart = {
		is_signup: true,
		currency: 'USD',
		total_cost: 0,
		products: [
			{
				is_signup: true,
				product_id: 'new-user-site',
				product_slug: 'new-user-site',
				product_name: 'new-user-site',
				currency: 'USD',
				volume: 1,
				cost: 0,
			},
		],
	};

	// Prepare a few more variables.

	const currentUser = getCurrentUser();
	const syntheticOrderId = 's_' + uuid().replace( /-/g, '' ); // 35-byte signup tracking ID.
	const usdCost = costToUSD( syntheticCart.total_cost, syntheticCart.currency );

	// Google Ads Gtag

	if ( mayWeTrackByTracker( AdTracker.GOOGLE_ADS ) ) {
		const params = [
			'event',
			'conversion',
			{
				send_to: TRACKING_IDS.wpcomGoogleAdsGtagSignup,
				value: syntheticCart.total_cost,
				currency: syntheticCart.currency,
				transaction_id: syntheticOrderId,
			},
		];
		debug( 'recordSignup: [Google Ads Gtag]', params );
		window.gtag( ...params );
	}

	// Bing

	if ( mayWeTrackByTracker( AdTracker.BING ) ) {
		if ( null !== usdCost ) {
			const params = {
				ec: 'signup',
				gv: usdCost,
			};
			debug( 'recordSignup: [Bing]', params );
			window.uetq.push( params );
		} else {
			debug( 'recordSignup: [Bing] currency not supported, dropping WPCom pixel' );
		}
	}

	// Facebook

	if ( mayWeTrackByTracker( AdTracker.FACEBOOK ) ) {
		const params = [
			'trackSingle',
			TRACKING_IDS.facebookInit,
			'Subscribe',
			{
				product_slug: syntheticCart.products
					.map( ( product ) => product.product_slug )
					.join( ', ' ),
				value: syntheticCart.total_cost,
				currency: syntheticCart.currency,
				user_id: currentUser ? currentUser.hashedPii.ID : 0,
				order_id: syntheticOrderId,
			},
		];
		debug( 'recordSignup: [Facebook]', params );
		window.fbq( ...params );
	}

	// DCM Floodlight

	if ( mayWeTrackByTracker( AdTracker.FLOODLIGHT ) ) {
		debug( 'recordSignup: [Floodlight]' );
		recordParamsInFloodlightGtag( {
			send_to: 'DC-6355556/wordp0/signu1+unique',
		} );
	}

	// Quantcast

	if ( mayWeTrackByTracker( AdTracker.QUANTCAST ) ) {
		const params = {
			qacct: TRACKING_IDS.quantcast,
			labels:
				'_fp.event.WordPress Signup,_fp.pcat.' +
				syntheticCart.products.map( ( product ) => product.product_slug ).join( ' ' ),
			orderid: syntheticOrderId,
			revenue: usdCost,
			event: 'refresh',
		};
		debug( 'recordSignup: [Quantcast]', params );
		window._qevents.push( params );
	}

	// Icon Media

	if ( mayWeTrackByTracker( AdTracker.ICON_MEDIA ) ) {
		debug( 'recordSignup: [Icon Media]', ICON_MEDIA_SIGNUP_PIXEL_URL );
		new window.Image().src = ICON_MEDIA_SIGNUP_PIXEL_URL;
	}

	// Pinterest

	if ( mayWeTrackByTracker( AdTracker.PINTEREST ) ) {
		const params = [
			'track',
			'signup',
			{
				value: syntheticCart.total_cost,
				currency: syntheticCart.currency,
			},
		];
		debug( 'recordSignup: [Pinterest]', params );
		window.pintrk( ...params );
	}

	// Twitter

	if ( mayWeTrackByTracker( AdTracker.TWITTER ) ) {
		const params = [ 'track', 'Signup', {} ];
		debug( 'recordSignup: [Twitter]', params );
		window.twq( ...params );
	}

	debug( 'recordSignup: dataLayer:', JSON.stringify( window.dataLayer, null, 2 ) );
}
