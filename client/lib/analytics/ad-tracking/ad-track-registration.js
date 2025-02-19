import { refreshCountryCodeCookieGdpr } from 'calypso/lib/analytics/utils';
import { mayWeTrackByTracker } from '../tracker-buckets';
import { debug, TRACKING_IDS } from './constants';
import { circularReferenceSafeJSONStringify } from './debug';
import { recordParamsInFloodlightGtag } from './floodlight';
import { loadTrackingScripts } from './load-tracking-scripts';

// Ensure setup has run.
import './setup';

export async function adTrackRegistration() {
	await refreshCountryCodeCookieGdpr();

	await loadTrackingScripts();

	// Google Ads Gtag

	if ( mayWeTrackByTracker( 'googleAds' ) ) {
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

	if ( mayWeTrackByTracker( 'facebook' ) ) {
		const params = [ 'trackSingle', TRACKING_IDS.facebookInit, 'Lead' ];
		debug( 'adTrackRegistration: [Facebook]', params );
		window.fbq( ...params );
	}

	// Bing

	if ( mayWeTrackByTracker( 'bing' ) ) {
		const params = {
			ec: 'registration',
		};
		debug( 'adTrackRegistration: [Bing]', params );
		window.uetq.push( params );
	}

	// DCM Floodlight

	if ( mayWeTrackByTracker( 'floodlight' ) ) {
		debug( 'adTrackRegistration: [Floodlight]' );
		recordParamsInFloodlightGtag( {
			send_to: 'DC-6355556/wordp0/regis0+unique',
		} );
	}

	// Pinterest

	if ( mayWeTrackByTracker( 'pinterest' ) ) {
		const params = [ 'track', 'lead' ];
		debug( 'adTrackRegistration: [Pinterest]', params );
		window.pintrk( ...params );
	}

	// Twitter

	if ( mayWeTrackByTracker( 'twitter' ) ) {
		const params = [ 'event', 'tw-nvzbs-odfz8' ];
		debug( 'adTrackRegistration: [Twitter]', params );
		window.twq( ...params );
	}

	debug(
		'adTrackRegistration: dataLayer:',
		circularReferenceSafeJSONStringify( window.dataLayer, 2 )
	);
}
