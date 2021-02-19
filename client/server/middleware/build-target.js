/**
 * External dependencies
 */
import { matchesUA } from 'browserslist-useragent';

/**
 * Checks whether a user agent is included in the browser list for an environment.
 *
 * @param {string} userAgentString The user agent string.
 * @param {string} environment The `browserslist` environment.
 *
 * @returns {boolean} Whether the user agent is included in the browser list.
 */
function isUAInBrowserslist( userAgentString, environment = 'defaults' ) {
	return matchesUA( userAgentString, {
		env: environment,
		ignorePatch: true,
		ignoreMinor: true,
		allowHigherVersions: true,
	} );
}

export default ( calypsoEnv ) => ( req, res, next ) => {
	let target;
	const isDevelopment = process.env.NODE_ENV === 'development';
	const isDesktop = calypsoEnv === 'desktop' || calypsoEnv === 'desktop-development';

	if ( isDesktop ) {
		target = 'evergreen';
	} else if ( isDevelopment ) {
		target = process.env.DEV_TARGET || 'evergreen';
	} else if ( req.query.forceFallback ) {
		// Did the user force fallback, via query parameter?
		target = 'fallback';
	} else {
		target = isUAInBrowserslist( req.useragent.source, 'evergreen' ) ? 'evergreen' : 'fallback';
	}

	req.getTarget = () => ( target === 'fallback' ? null : target );

	next();
};
