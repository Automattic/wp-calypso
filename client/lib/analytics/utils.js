/** @format */

/**
 * External dependencies
 */

import cookie from 'cookie';
import debugFactory from 'debug';
import sha256 from 'hash.js/lib/hash/sha/256';
import { assign, includes } from 'lodash';
import { parse as parseUrl } from 'url';

/**
 * Internal dependencies
 */
import config from 'config';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:analytics:utils' );

// For converting other currencies into USD for tracking purposes.
// Short-term fix, taken from <https://openexchangerates.org/> (last updated 2019-04-10).
const EXCHANGE_RATES = {
	AED: 3.673181,
	AFN: 77.277444,
	ALL: 110.685,
	AMD: 485.718536,
	ANG: 1.857145,
	AOA: 318.1145,
	ARS: 42.996883,
	AUD: 1.39546,
	AWG: 1.801247,
	AZN: 1.7025,
	BAM: 1.73465,
	BBD: 2,
	BDT: 84.350813,
	BGN: 1.7345,
	BHD: 0.377065,
	BIF: 1829.456861,
	BMD: 1,
	BND: 1.350704,
	BOB: 6.910218,
	BRL: 3.825491,
	BSD: 1,
	BTC: 0.000188070491,
	BTN: 69.241,
	BWP: 10.571,
	BYN: 2.12125,
	BZD: 2.01582,
	CAD: 1.331913,
	CDF: 1640.538151,
	CHF: 1.002295,
	CLF: 0.024214,
	CLP: 662.405194,
	CNH: 6.718409,
	CNY: 6.7164,
	COP: 3102.756403,
	CRC: 603.878956,
	CUC: 1,
	CUP: 25.75,
	CVE: 98.34575,
	CZK: 22.699242,
	DJF: 178,
	DKK: 6.620894,
	DOP: 50.601863,
	DZD: 119.094464,
	EGP: 17.321,
	ERN: 14.996695,
	ETB: 28.87,
	EUR: 0.886846,
	FJD: 2.135399,
	FKP: 0.763495,
	GBP: 0.763495,
	GEL: 2.695,
	GGP: 0.763495,
	GHS: 5.18885,
	GIP: 0.763495,
	GMD: 49.5025,
	GNF: 9126.453332,
	GTQ: 7.6503,
	GYD: 207.888008,
	HKD: 7.83635,
	HNL: 24.53,
	HRK: 6.587,
	HTG: 84.642,
	HUF: 285.120971,
	IDR: 14140.665178,
	ILS: 3.57935,
	IMP: 0.763495,
	INR: 69.1502,
	IQD: 1190,
	IRR: 42105,
	ISK: 119.899897,
	JEP: 0.763495,
	JMD: 129.28,
	JOD: 0.709001,
	JPY: 110.9875,
	KES: 101.11,
	KGS: 68.708365,
	KHR: 4021.592884,
	KMF: 437.375,
	KPW: 900,
	KRW: 1137.899434,
	KWD: 0.304268,
	KYD: 0.833459,
	KZT: 378.893401,
	LAK: 8630.377846,
	LBP: 1509.5,
	LKR: 174.733735,
	LRD: 164.499779,
	LSL: 14.1,
	LYD: 1.391411,
	MAD: 9.622,
	MDL: 17.513226,
	MGA: 3642.597503,
	MKD: 54.731723,
	MMK: 1510.092364,
	MNT: 2511.632328,
	MOP: 8.07298,
	MRO: 357,
	MRU: 36.55,
	MUR: 34.9505,
	MVR: 15.424994,
	MWK: 728.565,
	MXN: 18.8201,
	MYR: 4.1106,
	MZN: 64.576343,
	NAD: 14.11,
	NGN: 360.105269,
	NIO: 33.04,
	NOK: 8.49614,
	NPR: 110.785702,
	NZD: 1.47776,
	OMR: 0.38502,
	PAB: 1,
	PEN: 3.294475,
	PGK: 3.374968,
	PHP: 51.872601,
	PKR: 141.62807,
	PLN: 3.79605,
	PYG: 6186.225628,
	QAR: 3.641793,
	RON: 4.217807,
	RSD: 104.64086,
	RUB: 64.2743,
	RWF: 904.135,
	SAR: 3.75,
	SBD: 8.21464,
	SCR: 13.675964,
	SDG: 47.613574,
	SEK: 9.261891,
	SGD: 1.351801,
	SHP: 0.763495,
	SLL: 8390,
	SOS: 578.545,
	SRD: 7.458,
	SSP: 130.2634,
	STD: 21050.59961,
	STN: 21.8,
	SVC: 8.751385,
	SYP: 514.993308,
	SZL: 13.972654,
	THB: 31.75,
	TJS: 9.434819,
	TMT: 3.509961,
	TND: 3.0117,
	TOP: 2.267415,
	TRY: 5.683728,
	TTD: 6.768744,
	TWD: 30.840434,
	TZS: 2315.252864,
	UAH: 26.819481,
	UGX: 3758.198709,
	USD: 1,
	UYU: 33.969037,
	UZS: 8427.57062,
	VEF: 248487.642241,
	VES: 3305.47961,
	VND: 23197.866398,
	VUV: 111.269352,
	WST: 2.607815,
	XAF: 581.732894,
	XAG: 0.06563851,
	XAU: 0.00076444,
	XCD: 2.70255,
	XDR: 0.717354,
	XOF: 581.732894,
	XPD: 0.00071959,
	XPF: 105.828888,
	XPT: 0.00110645,
	YER: 250.35,
	ZAR: 13.909458,
	ZMW: 12.110083,
	ZWL: 322.355011,
};

/**
 * `localStorage` key for marketing coupons.
 *
 * @type {String} `localStorage` key.
 */
export const MARKETING_COUPONS_KEY = 'marketing-coupons';

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

/**
 * Decodes a url-safe base64 encoded string.
 *
 * @param {String} str The url-safe base64 encoded string
 * @return {String} The decoded string
 */
function urlSafeBase64DecodeString( str ) {
	const decodeMap = {
		'-': '+',
		_: '/',
		'.': '=',
	};

	return atob( str.replace( /[-_.]/g, ch => decodeMap[ ch ] ) );
}

/**
 * Decodes a URL param encoded by AMP's linker.js
 * See also https://github.com/ampproject/amphtml/blob/master/extensions/amp-analytics/linker-id-receiving.md
 *
 * @param {String} value Value to be decoded
 * @return {null|Object} null or and object containing key/value pairs
 */
function parseAmpEncodedParams( value ) {
	value = value
		.split( '*' )
		.filter( val => val.length )
		.slice( 2 );
	// return null if empty or we have an odd number of elements
	if ( 0 === value.length || 0 !== value.length % 2 ) {
		return null;
	}
	const keyValMap = {};
	for ( let i = 0; i < value.length; i += 2 ) {
		keyValMap[ value[ i ] ] = urlSafeBase64DecodeString( value[ i + 1 ] );
	}

	return keyValMap;
}

/**
 * Remembers `?coupon` query argument via `localStorage`.
 */
export function saveCouponQueryArgument() {
	// Read coupon query argument, return early if there is none.
	const parsedUrl = urlParseAmpCompatible( location.href );
	const couponCode = parsedUrl.query.coupon;
	if ( ! couponCode ) {
		return;
	}

	// Read coupon list from localStorage, create new if it's not there yet, refresh existing.
	const couponsJson = localStorage.getItem( MARKETING_COUPONS_KEY );
	const coupons = JSON.parse( couponsJson ) || {};
	const THIRTY_DAYS_MILLISECONDS = 30 * 24 * 60 * 60 * 1000;
	const now = Date.now();
	debug( 'Found coupons in localStorage: ', coupons );

	coupons[ couponCode ] = now;

	// Delete coupons if they're older than 30 days.
	Object.keys( coupons ).forEach( key => {
		if ( now > coupons[ key ] + THIRTY_DAYS_MILLISECONDS ) {
			delete coupons[ key ];
		}
	} );

	// Write remembered coupons back to localStorage.
	debug( 'Storing coupons in localStorage: ', coupons );
	localStorage.setItem( MARKETING_COUPONS_KEY, JSON.stringify( coupons ) );
}

/**
 * Returns an object equivalent to what url.parse( url, true ) would return plus the data extracted from `tk_amp`.
 * URL parameters explicitly present in the URL take precedence over the ones extracted from `tk_amp`.
 * This function is used to support AMP-compatible tracking.
 *
 * @param {String} url URL to be parsed like `document.location.href`.
 * @return {Object} An object equivalent to what url.parse( url, true ) would return plus the data extracted from in `tk_amp`
 */
export function urlParseAmpCompatible( url ) {
	const parsedUrl = parseUrl( url, true );
	const query = parsedUrl.query;

	debug( 'urlParseAmpCompatible: original query:', query );

	if ( 'tk_amp' in query ) {
		const tk_amp = parseAmpEncodedParams( query.tk_amp );
		debug( 'urlParseAmpCompatible: tk_amp:', tk_amp );
		parsedUrl.query = assign( {}, tk_amp, query );
	}

	debug( 'urlParseAmpCompatible: merged query:', parsedUrl.query );

	return parsedUrl;
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
