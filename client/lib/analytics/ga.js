/**
 * External dependencies
 */
import debug from 'debug';

/**
 * Internal dependencies
 */
import {
	getGoogleAnalyticsDefaultConfig,
	setupGoogleAnalyticsGtag,
	isGoogleAnalyticsAllowed,
	fireGoogleAnalyticsPageView,
	fireGoogleAnalyticsEvent,
	fireGoogleAnalyticsTiming,
} from 'lib/analytics/ad-tracking';

const gaDebug = debug( 'calypso:analytics:ga' );

let initialized = false;

function initialize() {
	if ( ! initialized ) {
		const parameters = {
			send_page_view: false,
			...getGoogleAnalyticsDefaultConfig(),
		};

		gaDebug( 'parameters:', parameters );

		setupGoogleAnalyticsGtag( parameters );

		initialized = true;
	}
}

export const gaRecordPageView = makeGoogleAnalyticsTrackingFunction( function recordPageView(
	urlPath,
	pageTitle
) {
	gaDebug( 'Recording Page View ~ [URL: ' + urlPath + '] [Title: ' + pageTitle + ']' );

	fireGoogleAnalyticsPageView( urlPath, pageTitle );
} );

/**
 * Fires a generic Google Analytics event
 *
 * {string} category Is the string that will appear as the event category.
 * {string} action Is the string that will appear as the event action in Google Analytics Event reports.
 * {string} label Is the string that will appear as the event label.
 * {string} value Is a non-negative integer that will appear as the event value.
 */
export const gaRecordEvent = makeGoogleAnalyticsTrackingFunction( function recordEvent(
	category,
	action,
	label,
	value
) {
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
} );

export const gaRecordTiming = makeGoogleAnalyticsTrackingFunction( function recordTiming(
	urlPath,
	eventType,
	duration,
	triggerName
) {
	gaDebug( 'Recording Timing ~ [URL: ' + urlPath + '] [Duration: ' + duration + ']' );

	fireGoogleAnalyticsTiming( eventType, duration, urlPath, triggerName );
} );

/**
 * Wrap Google Analytics with debugging, possible analytics supression, and initialization
 *
 * This method will display debug output if Google Analytics is suppresed, otherwise it will
 * initialize and call the Google Analytics function it is passed.
 *
 * @see isGoogleAnalyticsAllowed
 *
 * @param  {Function} func Google Analytics tracking function
 * @returns {Function} Wrapped function
 */
export function makeGoogleAnalyticsTrackingFunction( func ) {
	return function( ...args ) {
		if ( ! isGoogleAnalyticsAllowed() ) {
			gaDebug( '[Disallowed] analytics %s( %o )', func.name, args );
			return;
		}

		initialize();

		func( ...args );
	};
}
