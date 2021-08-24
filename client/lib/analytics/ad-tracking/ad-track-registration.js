/**
 * Internal dependencies
 */
import { isAdTrackingAllowed, refreshCountryCodeCookieGdpr } from 'calypso/lib/analytics/utils';
import { getCurrentUser } from '@automattic/calypso-analytics';

import {
	debug,
	isFacebookEnabled,
	isBingEnabled,
	isWpcomGoogleAdsGtagEnabled,
	isFloodlightEnabled,
	isPinterestEnabled,
	isIponwebEnabled,
	TRACKING_IDS,
} from './constants';
import { loadTrackingScripts } from './load-tracking-scripts';
import { recordParamsInFloodlightGtag } from './floodlight';

// Ensure setup has run.
import './setup';

export async function adTrackRegistration() {
	await refreshCountryCodeCookieGdpr();

	if ( ! isAdTrackingAllowed() ) {
		debug( 'adTrackRegistration: [Skipping] ad tracking is not allowed' );
		return;
	}

	await loadTrackingScripts();
	const currentUser = getCurrentUser();

	// Google Ads Gtag

	if ( isWpcomGoogleAdsGtagEnabled ) {
		const params = [
			'event',
			'conversion',
			{
				send_to: TRACKING_IDS.wpcomGoogleAdsGtagRegistration,
			},
		];
		debug( 'adTrackRegistration: [Google Ads Gtag]', params );
		window.gtag( ...params );
	}

	// Facebook

	if ( isFacebookEnabled ) {
		const params = [ 'trackSingle', TRACKING_IDS.facebookInit, 'Lead' ];
		debug( 'adTrackRegistration: [Facebook]', params );
		window.fbq( ...params );
	}

	// Bing

	if ( isBingEnabled ) {
		const params = {
			ec: 'registration',
		};
		debug( 'adTrackRegistration: [Bing]', params );
		window.uetq.push( params );
	}

	// DCM Floodlight

	if ( isFloodlightEnabled ) {
		debug( 'adTrackRegistration: [Floodlight]' );
		recordParamsInFloodlightGtag( {
			send_to: 'DC-6355556/wordp0/regis0+unique',
		} );
	}

	// Pinterest

	if ( isPinterestEnabled ) {
		const params = [ 'track', 'lead' ];
		debug( 'adTrackRegistration: [Pinterest]', params );
		window.pintrk( ...params );
	}

	// Iponweb

	if ( isIponwebEnabled ) {
		debug( 'adTrackRegistration: [Iponweb]' );
		window.smartPixel( 'sendEvent', {
			id: 'registration',
			data: {
				is_new_user: 0,
				user_id: currentUser ? currentUser.hashedPii.ID : '',
			},
		} );
	}

	debug( 'adTrackRegistration: dataLayer:', JSON.stringify( window.dataLayer, null, 2 ) );
}
