import { getCurrentUser } from '@automattic/calypso-analytics';
import { refreshCountryCodeCookieGdpr } from 'calypso/lib/analytics/utils';
import { mayWeTrackByTracker } from '../tracker-buckets';
import { debug, TRACKING_IDS } from './constants';
import { recordParamsInFloodlightGtag } from './floodlight';
import { loadTrackingScripts } from './load-tracking-scripts';
import {
	recordMigrationSignupEvent,
	recordMigrationSignupFacebookEvent,
} from './record-migration-events';

// Ensure setup has run.
import './setup';

export async function adTrackSignupStart( flow ) {
	await refreshCountryCodeCookieGdpr();

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

	// Google Ads and Facebook for site-migration flow.
	if ( 'site-migration' === flow ) {
		recordMigrationSignupEvent( 'adTrackSignupStart' );
		recordMigrationSignupFacebookEvent( 'adTrackSignupStart' );
	}
}
