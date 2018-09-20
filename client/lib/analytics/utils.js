/** @format */

/**
 * External dependencies
 */

import debugFactory from 'debug';
import sha256 from 'hash.js/lib/hash/sha/256';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:analytics:utils' );

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
 * Are ads blacklisted from the given URL for better performance?
 *
 * @returns {Boolean} true if the current URL is blacklisted.
 */
export function isBlacklistedForPerformance() {
	const { href } = document.location;
	const match = pattern => href.indexOf( pattern ) !== -1;
	const result = blacklistedRoutes.some( match );

	debug( `Is URL Blacklisted for Performance: ${ result }` );
	return result;
}

/**
 * Check if the user has DNT enabled or if the route is blacklisted from showing
 * ads (either due to performance concerns or PII exposure).
 *
 * @returns {Boolean} true if we should skip showing ads
 */
export function shouldSkipAds() {
	const result = isBlacklistedForPerformance() || isPiiUrl() || doNotTrack();

	debug( `Is Skipping Ads: ${ result }` );
	return result;
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
