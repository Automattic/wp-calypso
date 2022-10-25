import { getCurrentUser } from '@automattic/calypso-analytics';
import { refreshCountryCodeCookieGdpr } from 'calypso/lib/analytics/utils';
import { mayWeTrackByTracker, mayWeTrackByBucket, Bucket } from '../tracker-buckets';
import { debug, TRACKING_IDS } from './constants';
import { recordParamsInFloodlightGtag } from './floodlight';
import { loadTrackingScripts } from './load-tracking-scripts';

// Ensure setup has run.
import './setup';

export async function adTrackSignupStart( flow ) {
	await refreshCountryCodeCookieGdpr();

	if ( ! mayWeTrackByBucket( Bucket.ADVERTISING ) ) {
		debug( 'adTrackSignupStart: [Skipping] ad tracking is not allowed' );
		return;
	}

	await loadTrackingScripts();
	const currentUser = getCurrentUser();

	// Floodlight.

	if ( mayWeTrackByTracker( 'floodlight' ) ) {
		debug( 'adTrackSignupStart: [Floodlight]' );
		recordParamsInFloodlightGtag( {
			send_to: 'DC-6355556/wordp0/pre-p0+unique',
		} );
	}
	if ( mayWeTrackByTracker( 'floodlight' ) && ! currentUser && 'onboarding' === flow ) {
		debug( 'adTrackSignupStart: [Floodlight]' );
		recordParamsInFloodlightGtag( {
			send_to: 'DC-6355556/wordp0/landi00+unique',
		} );
	}

	// Google Ads.

	if ( mayWeTrackByTracker( 'googleAds' ) && ! currentUser && 'onboarding' === flow ) {
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
