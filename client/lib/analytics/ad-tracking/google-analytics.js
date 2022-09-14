import { getCurrentUser, getDoNotTrack } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { isPiiUrl, mayWeTrackCurrentUserGdpr } from 'calypso/lib/analytics/utils';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isGoogleAnalyticsEnabled, TRACKING_IDS } from './constants';
import * as GA4 from './google-analytics-4';

// Ensure setup has run.
import './setup';

export function setupGoogleAnalyticsGtag( params ) {
	GA4.setup( params );

	window.gtag( 'config', TRACKING_IDS.wpcomGoogleAnalyticsGtag, params );

	if ( isJetpackCloud() ) {
		window.gtag( 'config', TRACKING_IDS.jetpackGoogleAnalyticsGtag, params );
	}
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
		linker: isJetpackCloud() ? { domains: [ 'wordpress.com' ] } : { accept_incoming: true },
	};
}

/**
 * Fires Google Analytics page view event
 *
 * @param {string} urlPath The path of the current page
 * @param {string} pageTitle The title of the current page
 * @param {boolean} useJetpackGoogleAnalytics send the page view to Jetpack Google Analytics
 */
export function fireGoogleAnalyticsPageView(
	urlPath,
	pageTitle,
	useJetpackGoogleAnalytics = false
) {
	const ga4PropertyGtag = useJetpackGoogleAnalytics
		? GA4.Ga4PropertyGtag.JETPACK
		: GA4.Ga4PropertyGtag.WPCOM;
	GA4.firePageView( pageTitle, urlPath, ga4PropertyGtag );

	const params = {
		...getGoogleAnalyticsDefaultConfig(),
		page_path: urlPath,
		page_title: pageTitle,
	};

	window.gtag( 'config', TRACKING_IDS.wpcomGoogleAnalyticsGtag, params );

	if ( useJetpackGoogleAnalytics ) {
		window.gtag( 'config', TRACKING_IDS.jetpackGoogleAnalyticsGtag, params );
	}
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
