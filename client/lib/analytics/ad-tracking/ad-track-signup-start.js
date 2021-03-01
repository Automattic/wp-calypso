/**
 * Internal dependencies
 */
import { isAdTrackingAllowed, refreshCountryCodeCookieGdpr } from 'calypso/lib/analytics/utils';

import { getCurrentUser } from '@automattic/calypso-analytics';
import { debug, isWpcomGoogleAdsGtagEnabled, isFloodlightEnabled, TRACKING_IDS } from './constants';
import { loadTrackingScripts } from './load-tracking-scripts';
import { recordParamsInFloodlightGtag } from './floodlight';

// Ensure setup has run.
import './setup';

export async function adTrackSignupStart( flow ) {
	await refreshCountryCodeCookieGdpr();

	if ( ! isAdTrackingAllowed() ) {
		debug( 'adTrackSignupStart: [Skipping] ad tracking is not allowed' );
		return;
	}

	await loadTrackingScripts();
	const currentUser = getCurrentUser();

	// Floodlight.

	if ( isFloodlightEnabled ) {
		debug( 'adTrackSignupStart: [Floodlight]' );
		recordParamsInFloodlightGtag( {
			send_to: 'DC-6355556/wordp0/pre-p0+unique',
		} );
	}
	if ( isFloodlightEnabled && ! currentUser && 'onboarding' === flow ) {
		debug( 'adTrackSignupStart: [Floodlight]' );
		recordParamsInFloodlightGtag( {
			send_to: 'DC-6355556/wordp0/landi00+unique',
		} );
	}

	// Google Ads.

	if ( isWpcomGoogleAdsGtagEnabled && ! currentUser && 'onboarding' === flow ) {
		const params = [
			'event',
			'conversion',
			{
				send_to: TRACKING_IDS.wpcomGoogleAdsGtagSignupStart,
			},
		];
		debug( 'adTrackSignupStart: [Google Ads Gtag]', params );
		window.gtag( ...params );
	}
}
