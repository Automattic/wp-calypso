/**
 * Internal dependencies
 */
import config from 'calypso/config';
import { isPiiUrl, mayWeTrackCurrentUserGdpr } from 'calypso/lib/analytics/utils';

import { getCurrentUser, getDoNotTrack } from '@automattic/calypso-analytics';
import { isGoogleAnalyticsEnabled, TRACKING_IDS } from './constants';
import { setupGtag } from './setup-gtag';

// Ensure setup has run.
import './setup';

export function setupGoogleAnalyticsGtag( options ) {
	setupGtag();
	window.gtag( 'config', TRACKING_IDS.wpcomGoogleAnalyticsGtag, options );
}

/**
 * Returns whether Google Analytics is allowed.
 *
 * This function returns false if:
 *
 * 1. `isGoogleAnalyticsEnabled` is `true`
 * 2. `ad-tracking` feature is disabled
 * 3. `Do Not Track` is enabled
 * 4. the current user could be in the GDPR zone and hasn't consented to tracking
 * 5. `document.location.href` may contain personally identifiable information
 *
 * Note that getDoNotTrack() and isPiiUrl() can change at any time which is why we do not cache them.
 *
 * @returns {boolean} true if GA is allowed.
 */
export function isGoogleAnalyticsAllowed() {
	return (
		isGoogleAnalyticsEnabled &&
		config.isEnabled( 'ad-tracking' ) &&
		! getDoNotTrack() &&
		! isPiiUrl() &&
		mayWeTrackCurrentUserGdpr()
	);
}

/**
 * Returns the default configuration for Google Analytics
 *
 * @returns {object} GA's default config
 */
export function getGoogleAnalyticsDefaultConfig() {
	const currentUser = getCurrentUser();

	return {
		...( currentUser && { user_id: currentUser.hashedPii.ID } ),
		anonymize_ip: true,
		transport_type: 'function' === typeof window.navigator.sendBeacon ? 'beacon' : 'xhr',
		use_amp_client_id: true,
		custom_map: {
			dimension3: 'client_id',
		},
	};
}

/**
 * Fires Google Analytics page view event
 *
 * @param {string} urlPath The path of the current page
 * @param {string} pageTitle The title of the current page
 */
export function fireGoogleAnalyticsPageView( urlPath, pageTitle ) {
	window.gtag( 'config', TRACKING_IDS.wpcomGoogleAnalyticsGtag, {
		...getGoogleAnalyticsDefaultConfig(),
		page_path: urlPath,
		page_title: pageTitle,
	} );
}

/**
 * Fires a generic Google Analytics event
 *
 * @param {string} category Is the string that will appear as the event category.
 * @param {string} action Is the string that will appear as the event action in Google Analytics Event reports.
 * @param {string} label Is the string that will appear as the event label.
 * @param {number} value Is a non-negative integer that will appear as the event value.
 */
export function fireGoogleAnalyticsEvent( category, action, label, value ) {
	window.gtag( 'event', action, {
		event_category: category,
		event_label: label,
		value: value,
	} );
}

/**
 * Fires a generic Google Analytics timing
 *
 * @param {string} name A string to identify the variable being recorded (e.g. 'load').
 * @param {number} value The number of milliseconds in elapsed time to report to Google Analytics (e.g. 20).
 * @param {string} event_category A string for categorizing all user timing variables into logical groups (e.g. 'JS Dependencies').
 * @param {string} event_label A string that can be used to add flexibility in visualizing user timings in the reports (e.g. 'Google CDN').
 */
export function fireGoogleAnalyticsTiming( name, value, event_category, event_label ) {
	window.gtag( 'event', 'timing_complete', {
		name: name,
		value: value,
		event_category: event_category,
		event_label: event_label,
	} );
}
