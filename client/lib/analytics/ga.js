import debug from 'debug';
import {
	getGoogleAnalyticsDefaultConfig,
	setupGoogleAnalyticsGtag,
	fireGoogleAnalyticsPageView,
	fireGoogleAnalyticsEvent,
} from 'calypso/lib/analytics/ad-tracking';
import isAkismetCheckout from '../akismet/is-akismet-checkout';
import isJetpackCheckout from '../jetpack/is-jetpack-checkout';
import isJetpackCloud from '../jetpack/is-jetpack-cloud';
import { mayWeTrackByTracker } from './tracker-buckets';

const gaDebug = debug( 'calypso:analytics:ga' );

let initialized = false;

function initialize() {
	if ( ! initialized ) {
		const params = {
			send_page_view: false,
			...getGoogleAnalyticsDefaultConfig(),
		};

		// We enable custom cross-domain linking for Akismet and Jetpack checkouts + Jetpack Cloud
		if ( isAkismetCheckout() || isJetpackCloud() || isJetpackCheckout() ) {
			const queryParams = new URLSearchParams( location.search );
			const gl = queryParams.get( '_gl' );

			// If we have a _gl query param, cross-domain linking is done automatically
			if ( ! gl ) {
				// Setting cross-domain manually: https://support.google.com/analytics/answer/10071811?hl=en#zippy=%2Cmanual-setup
				params.client_id = queryParams.get( '_gl_cid' );
				params.session_id = queryParams.get( '_gl_sid' );
			}
		}

		gaDebug( 'parameters:', params );

		setupGoogleAnalyticsGtag( params );

		initialized = true;
	}
}

export const gaRecordPageView = makeGoogleAnalyticsTrackingFunction( function recordPageView(
	urlPath,
	pageTitle,
	useJetpackGoogleAnalytics = false,
	useAkismetGoogleAnalytics = false
) {
	gaDebug(
		'Recording Page View ~ [URL: ' +
			urlPath +
			'] [Title: ' +
			pageTitle +
			'] [useJetpackGoogleAnalytics: ' +
			useJetpackGoogleAnalytics +
			'] [useAksiemtGoogleAnalytics: ' +
			useAkismetGoogleAnalytics +
			']'
	);

	fireGoogleAnalyticsPageView(
		urlPath,
		pageTitle,
		useJetpackGoogleAnalytics,
		useAkismetGoogleAnalytics
	);
} );

/**
 * Fires a generic Google Analytics event
 *
 * {string} category Is the string that will appear as the event category.
 * {string} action Is the string that will appear as the event action in Google Analytics Event reports.
 * {string} label Is the string that will appear as the event label.
 * {string} value Is a non-negative integer that will appear as the event value.
 */
export const gaRecordEvent = makeGoogleAnalyticsTrackingFunction(
	function recordEvent( category, action, label, value ) {
		if ( 'undefined' !== typeof value && ! isNaN( Number( String( value ) ) ) ) {
			value = Math.round( Number( String( value ) ) ); // GA requires an integer value.
			// https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#eventValue
		}

		let debugText = 'Recording Event ~ [Category: ' + category + '] [Action: ' + action + ']';

		if ( 'undefined' !== typeof label ) {
			debugText += ' [Option Label: ' + label + ']';
		}

		if ( 'undefined' !== typeof value ) {
			debugText += ' [Option Value: ' + value + ']';
		}

		gaDebug( debugText );

		fireGoogleAnalyticsEvent( category, action, label, value );
	}
);

/**
 * Wrap Google Analytics with debugging, possible analytics supression, and initialization
 *
 * This method will display debug output if Google Analytics is suppresed, otherwise it will
 * initialize and call the Google Analytics function it is passed.
 * @see mayWeTrackByTracker
 * @param  {Function} func Google Analytics tracking function
 * @returns {Function} Wrapped function
 */
export function makeGoogleAnalyticsTrackingFunction( func ) {
	return function ( ...args ) {
		if ( ! mayWeTrackByTracker( 'ga' ) ) {
			gaDebug( '[Disallowed] analytics %s( %o )', func.name, args );
			return;
		}

		initialize();

		func( ...args );
	};
}
