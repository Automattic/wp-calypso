/** @format */

/**
 * External dependencies
 */

import cookie from 'cookie';
import debugFactory from 'debug';
import sha256 from 'hash.js/lib/hash/sha/256';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:analytics:utils' );

// For converting other currencies into USD for tracking purposes
const EXCHANGE_RATES = {
	USD: 1,
	EUR: 1,
	JPY: 125,
	AUD: 1.35,
	CAD: 1.35,
	GBP: 0.75,
	BRL: 2.55,
};

/**
 * Returns whether a currency is supported
 *
 * @param {String} currency - `USD`, `JPY`, etc
 * @returns {Boolean} Whether there's an exchange rate for the currency
 */
function isSupportedCurrency( currency ) {
	return Object.keys( EXCHANGE_RATES ).indexOf( currency ) !== -1;
}

/**
 * Converts a cost into USD
 *
 * @note Don't rely on this for precise conversions, it's meant to be an estimate for ad tracking purposes
 *
 * @param {Number} cost - The cost of the cart or product
 * @param {String} currency - The currency such as `USD`, `JPY`, etc
 * @returns {String} Or null if the currency is not supported
 */
export function costToUSD( cost, currency ) {
	if ( ! isSupportedCurrency( currency ) ) {
		return null;
	}

	return ( cost / EXCHANGE_RATES[ currency ] ).toFixed( 3 );
}

/**
 * Whether Do Not Track is enabled in the user's browser.
 *
 * @returns {Boolean} true if Do Not Track is enabled in the user's browser.
 */
export function doNotTrack() {
	const result = Boolean(
		window &&
			// Internet Explorer 11 uses window.doNotTrack rather than navigator.doNotTrack.
			// Safari 7.1.3+ uses window.doNotTrack rather than navigator.doNotTrack.
			// MDN ref: https://developer.mozilla.org/en-US/docs/Web/API/navigator/doNotTrack#Browser_compatibility
			( window.doNotTrack === '1' || ( window.navigator && window.navigator.doNotTrack === '1' ) )
	);
	debug( `Do Not Track: ${ result }` );
	return result;
}

/**
 * Hashes users' Personally Identifiable Information using SHA256
 *
 * @param {String|Number} data Data to be hashed
 * @returns {String} SHA256 in hex string format
 */
export function hashPii( data ) {
	return sha256()
		.update( data.toString() )
		.digest( 'hex' );
}

/**
 * Returns the current user email after normalizing it (lowercase without spaces) or `false` if no email or user is available.
 *
 * @param {Object} user The current user
 * @return {false|string} The current user email after normalization
 */
export function getNormalizedHashedUserEmail( user ) {
	const currentUser = user.get();
	if ( currentUser && currentUser.email ) {
		return hashPii( currentUser.email.toLowerCase().replace( /\s/g, '' ) );
	}

	return false;
}

// If this list catches things that are not necessarily forbidden we're ok with
// a little bit of approximation as long as we do catch the ones that we have to.
// We need to be quite aggressive with how we filter candiate pages as failing
// to protect our users' privacy puts us in breach of our own TOS and our
// retargeting partners' TOS. We also see personally identifiable information in
// unexpected places like email addresses in users' posts URLs and titles for
// various (usually accidental) reasons. We also pass PII in URLs like
// `wordpress.com/jetpack/connect` and `wordpress.com/error-report`.
const forbiddenPiiPatterns = [
	'@',
	'email=',
	'email_address=',
	'first=',
	'last=',
	'first-name=',
	'last-name=',
	'address-1=',
	'phone=',
];

const forbiddenPiiPatternsEnc = forbiddenPiiPatterns.map( pattern => {
	return encodeURIComponent( pattern );
} );

/**
 * Whether the current URL can potentially contain personally identifiable info.
 *
 * @returns {Boolean} true if the current URL can potentially contain personally identifiable info.
 */
export function isPiiUrl() {
	const href = document.location.href;
	const match = pattern => href.indexOf( pattern ) !== -1;
	const result = forbiddenPiiPatterns.some( match ) || forbiddenPiiPatternsEnc.some( match );

	debug( `Is PII URL: ${ result }` );
	return result;
}

// For better load performance, these routes are blacklisted from loading ads.
const blacklistedRoutes = [ '/log-in' ];

/**
 * Are tracking pixels forbidden from the given URL for better performance (except for Google Analytics)?
 *
 * @returns {Boolean} true if the current URL is blacklisted.
 */
export function isUrlBlacklistedForPerformance() {
	const { href } = document.location;
	const match = pattern => href.indexOf( pattern ) !== -1;
	const result = blacklistedRoutes.some( match );

	debug( `Is URL Blacklisted for Performance: ${ result }` );
	return result;
}

/**
 * Returns whether Google Analytics is allowed.
 *
 * This function returns false if:
 *
 * 1. `google-analytics` feature is disabled
 * 2. `Do Not Track` is enabled
 * 3. the current user could be in the GDPR zone and hasn't consented to tracking
 * 4. `document.location.href` may contain personally identifiable information
 *
 * Note that doNotTrack() and isPiiUrl() can change at any time which is why we do not cache them.
 *
 * @returns {Boolean} true if GA is allowed.
 */
export function isGoogleAnalyticsAllowed() {
	return (
		config.isEnabled( 'google-analytics' ) &&
		! doNotTrack() &&
		! isPiiUrl() &&
		mayWeTrackCurrentUserGdpr()
	);
}

/**
 * Returns whether ad tracking is allowed.
 *
 * This function returns false if:
 *
 * 1. 'ad-tracking' is disabled
 * 2. `Do Not Track` is enabled
 * 3. the current user could be in the GDPR zone and hasn't consented to tracking
 * 4. `document.location.href` may contain personally identifiable information
 *
 * @returns {Boolean} Is ad tracking is allowed?
 */
export function isAdTrackingAllowed() {
	const result =
		config.isEnabled( 'ad-tracking' ) &&
		! doNotTrack() &&
		! isUrlBlacklistedForPerformance() &&
		! isPiiUrl() &&
		mayWeTrackCurrentUserGdpr();
	debug( `isAdTrackingAllowed: ${ result }` );
	return result;
}

/**
 * Returns a boolean telling whether we may track the current user.
 *
 * @returns {Boolean} Whether we may track the current user
 */
export function mayWeTrackCurrentUserGdpr() {
	let result = false;
	const cookies = cookie.parse( document.cookie );
	if ( cookies.sensitive_pixel_option === 'yes' ) {
		result = true;
	} else if ( cookies.sensitive_pixel_option === 'no' ) {
		result = false;
	} else {
		result = ! isCurrentUserMaybeInGdprZone();
	}
	debug( `mayWeTrackCurrentUserGdpr: ${ result }` );
	return result;
}

/**
 * Returns a boolean telling whether the current user could be in the GDPR zone.
 *
 * @returns {Boolean} Whether the current user could be in the GDPR zone
 */
export function isCurrentUserMaybeInGdprZone() {
	const cookies = cookie.parse( document.cookie );
	const countryCode = cookies.country_code;

	if ( ! countryCode || 'unknown' === countryCode ) {
		return true;
	}

	const gdprCountries = [
		// European Member countries
		'AT', // Austria
		'BE', // Belgium
		'BG', // Bulgaria
		'CY', // Cyprus
		'CZ', // Czech Republic
		'DE', // Germany
		'DK', // Denmark
		'EE', // Estonia
		'ES', // Spain
		'FI', // Finland
		'FR', // France
		'GR', // Greece
		'HR', // Croatia
		'HU', // Hungary
		'IE', // Ireland
		'IT', // Italy
		'LT', // Lithuania
		'LU', // Luxembourg
		'LV', // Latvia
		'MT', // Malta
		'NL', // Netherlands
		'PL', // Poland
		'PT', // Portugal
		'RO', // Romania
		'SE', // Sweden
		'SI', // Slovenia
		'SK', // Slovakia
		'GB', // United Kingdom
		// Single Market Countries that GDPR applies to
		'CH', // Switzerland
		'IS', // Iceland
		'LI', // Liechtenstein
		'NO', // Norway
	];

	return includes( gdprCountries, countryCode );
}

const SITE_FRAGMENT_REGEX = /\/(:site|:site_id|:siteid|:blogid|:blog_id|:siteslug)(\/|$|\?)/i;

/**
 * Check if a path should report the currently selected site ID.
 *
 * Some paths should never report it because it's used
 * to tell general admin and site-specific activities apart.
 *
 * @param {String} path The tracked path.
 * @returns {Boolean} If the report should null `blog_id`.
 */
export const shouldReportOmitBlogId = path => {
	if ( ! path ) {
		return true;
	}
	return ! SITE_FRAGMENT_REGEX.test( path );
};
