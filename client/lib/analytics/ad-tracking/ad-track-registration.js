import { refreshCountryCodeCookieGdpr } from 'calypso/lib/analytics/utils';
import { mayWeTrackByTracker, AdTracker, mayWeTrackByBucket, Bucket } from '../tracker-buckets';
import { debug, TRACKING_IDS } from './constants';
import { recordParamsInFloodlightGtag } from './floodlight';
import { loadTrackingScripts } from './load-tracking-scripts';

// Ensure setup has run.
import './setup';

export async function adTrackRegistration() {
	await refreshCountryCodeCookieGdpr();

	if ( ! mayWeTrackByBucket( Bucket.ADVERTISING ) ) {
		debug( 'adTrackRegistration: [Skipping] ad tracking is not allowed' );
		return;
	}

	await loadTrackingScripts();

	// Google Ads Gtag

	if ( mayWeTrackByTracker( AdTracker.GOOGLE_ADS ) ) {
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

	if ( mayWeTrackByTracker( AdTracker.FACEBOOK ) ) {
		const params = [ 'trackSingle', TRACKING_IDS.facebookInit, 'Lead' ];
		debug( 'adTrackRegistration: [Facebook]', params );
		window.fbq( ...params );
	}

	// Bing

	if ( mayWeTrackByTracker( AdTracker.BING ) ) {
		const params = {
			ec: 'registration',
		};
		debug( 'adTrackRegistration: [Bing]', params );
		window.uetq.push( params );
	}

	// DCM Floodlight

	if ( mayWeTrackByTracker( AdTracker.FLOODLIGHT ) ) {
		debug( 'adTrackRegistration: [Floodlight]' );
		recordParamsInFloodlightGtag( {
			send_to: 'DC-6355556/wordp0/regis0+unique',
		} );
	}

	// Pinterest

	if ( mayWeTrackByTracker( AdTracker.PINTEREST ) ) {
		const params = [ 'track', 'lead' ];
		debug( 'adTrackRegistration: [Pinterest]', params );
		window.pintrk( ...params );
	}

	debug( 'adTrackRegistration: dataLayer:', JSON.stringify( window.dataLayer, null, 2 ) );
}
