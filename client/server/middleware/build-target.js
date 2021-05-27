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

export default () => ( req, res, next ) => {
	let target;
	const isDevelopment = process.env.NODE_ENV === 'development';

	if ( isDevelopment ) {
		target = process.env.DEV_TARGET || 'evergreen';
	} else if ( req.query.forceFallback ) {
		target = 'fallback';
	} else if ( req.query.forceEvergreen ) {
		target = 'evergreen';
	} else {
		target = isUAInBrowserslist( req.useragent.source, 'evergreen' ) ? 'evergreen' : 'fallback';
	}

	req.getTarget = () => ( target === 'fallback' ? null : target );
	req.bypassTargetRedirection = () => req.query.bypassTargetRedirection === 'true';

	next();
};
