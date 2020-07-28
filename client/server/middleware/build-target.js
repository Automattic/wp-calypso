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
	const isDevelopment = process.env.NODE_ENV === 'development';
	const isDesktop = calypsoEnv === 'desktop' || calypsoEnv === 'desktop-development';

	const devTarget = process.env.DEV_TARGET || 'evergreen';
	const uaTarget = isUAInBrowserslist( req.useragent.source, 'evergreen' )
		? 'evergreen'
		: 'fallback';

	// Did the user force fallback, via query parameter?
	const prodTarget = req.query.forceFallback ? 'fallback' : uaTarget;

	let target = isDevelopment ? devTarget : prodTarget;

	if ( isDesktop ) {
		target = 'fallback';
	}

	req.getTarget = () => {
		return target === 'fallback' ? null : target;
	};

	next();
};
