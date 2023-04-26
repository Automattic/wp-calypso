import { debug, TRACKING_IDS } from './constants';

// Ensure setup has run.
import './setup';

/**
 * Fire custom facebook conversion tracking event.
 *
 * @param {string} name - The name of the custom event.
 * @param {Object} properties - The custom event attributes.
 * @returns {void}
 */
export function trackCustomFacebookConversionEvent( name, properties ) {
	window.fbq && window.fbq( 'trackSingleCustom', TRACKING_IDS.facebookInit, name, properties );
}

/**
 * Fire custom adwords conversation tracking event.
 *
 * @param {Object} properties - The custom event attributes.
 * @returns {void}
 */
export function trackCustomAdWordsRemarketingEvent( properties ) {
	debug( 'trackCustomAdWordsRemarketingEvent:', properties );
	// Not sure this is currently serving any purpose and whether we can convert it to use Gtag.
	// Refactoring the middleware for analytics is outside the scope of this PR so I'll leave the function stub for now.
	/*
	window.google_trackConversion &&
		window.google_trackConversion( {
			google_conversion_id: ADWORDS_CONVERSION_ID,
			google_custom_params: properties,
			google_remarketing_only: true,
		} );
	*/
}
