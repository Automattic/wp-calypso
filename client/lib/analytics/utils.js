/** @format */

/**
 * External dependencies
 */

import debugFactory from 'debug';
import userModule from 'lib/user';

const crypto = require( 'crypto' );

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:analytics:utils' );
const user = userModule();

const userIdMd5 = user.get()
	? crypto
			.createHash( 'md5' )
			.update( user.get().ID.toString() )
			.digest( 'hex' )
	: 0;
const userEmailMd5 =
	user.get() && typeof user.get().email === 'string'
		? crypto
				.createHash( 'md5' )
				.update( user.get().email )
				.digest( 'hex' )
		: null;

debug( `User ID: ${ user.get().ID }, MD5: ${ userIdMd5 }` );
debug( `User email MD5: ${ userEmailMd5 }` );

export function getUserIdMd5() {
	return userIdMd5;
}

export function getUserEmailMd5() {
	return userEmailMd5;
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
