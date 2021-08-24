import { matchesUA } from 'browserslist-useragent';

/**
 * Checks whether a user agent is included in the browser list for an environment.
 *
 * @param {string} userAgentString The user agent string.
 * @param {string} environment The `browserslist` environment.
 * @returns {boolean} Whether the user agent is included in the browser list.
 */
function isUAInBrowserslist( userAgentString, environment = 'defaults' ) {
	// If the user agent string includes Electron, it probably comes from the
	// desktop app. Unfortunately, browserslist then parses the UA family to be
	// "WordPress". We need to make sure we test against the Electron version
	// instead, or the desktop app won't be considered a supported browser.
	const electronUA = userAgentString.match( /(Electron\/[0-9.]*\S)/ );

	return matchesUA( electronUA ? electronUA[ 0 ] : userAgentString, {
		env: environment,
		ignorePatch: true,
		ignoreMinor: true,
		allowHigherVersions: true,
	} );
}

export default () => ( req, res, next ) => {
	let target;
	const isDevelopment = process.env.NODE_ENV === 'development';

	if ( isDevelopment ) {
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
