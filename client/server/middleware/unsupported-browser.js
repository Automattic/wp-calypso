import config from '@automattic/calypso-config';
import { addQueryArgs } from 'calypso/lib/url';
import analytics from 'calypso/server/lib/analytics';

/**
 * The locales that are supported in exempting browser support checks.
 */
const SUPPORTED_LOCALES = [ 'en', ...config( 'magnificent_non_en_locales' ) ];

/**
 * The paths that are allowed even if the browser is unsupported.
 */
const ALLOWED_PATHS = [ 'browsehappy', 'themes', 'theme', 'calypso' ];

/**
 * We allow some paths even if the browser is unsupported.
 */
const ALLOWED_PATH_PATTERN = new RegExp(
	`^/((${ SUPPORTED_LOCALES.join( '|' ) })/)?(${ ALLOWED_PATHS.join( '|' ) })($|/)`
);

/**
 * @typedef {import('express-useragent').Details} UserAgentDetails
 */

/**
 * Get the major version number of a version string, formatted as "##.#" or "##.#.#".
 * @param {string} version Version string
 * @returns {number} Major version number
 */
const getMajorVersion = ( version ) => Number( version.split( '.' )[ 0 ] );

/**
 * This is a list of browsers which DEFINITELY do not work on WordPress.com.
 *
 * I created this list by finding the oldest version of Chrome which supports the
 * log-in page, and then finding which language feature was added in that release.
 *
 * In this case, the feature was optional chaining, which we use in our bundle,
 * but is not supported by these browsers. As a result, these browsers do not
 * work with the WordPress.com login page. See https://caniuse.com/?search=optional%20chaining.
 *
 * In other words, if you use Chrome v79, you won't be able to log in. But if you
 * use v80, the form works.
 *
 * For browsers not listed, we have not tested whether they work.
 *
 * Importantly, browsers are only completely supported if they fall within the range
 * listed in package.json. This list only serves as a way to assist users who are
 * using a browser which is definitely broken. It is not a guarantee that things
 * will work flawlessly on newer versions.
 * @type {Map<string, (ua: UserAgentDetails) => boolean>}
 */
const UNSUPPORTED_BROWSERS = new Map( [
	[ 'IE', () => true ],
	[ 'Edge', ( ua ) => getMajorVersion( ua.version ) <= 79 ],
	[ 'Firefox', ( ua ) => getMajorVersion( ua.version ) <= 73 ],
	[ 'Chrome', ( ua ) => getMajorVersion( ua.version ) <= 79 ],
	[ 'Safari', ( ua ) => getMajorVersion( ua.version ) <= 13 ],
	[ 'Opera', ( ua ) => getMajorVersion( ua.version ) <= 66 ],
] );

/**
 * Returns true if the browser via the request useragent is explicitly unsupported, or false
 * otherwise.
 * @param {import('express').Request & { useragent: UserAgentDetails }} req
 * @returns {boolean} Whether the browser is unsupported
 */
const isUnsupportedBrowser = ( req ) =>
	UNSUPPORTED_BROWSERS.get( req.useragent.browser )?.( req.useragent ) === true;

/**
 * These public pages work even in unsupported browsers, so we do not redirect them.
 */
const isAllowedPath = ( path ) => ALLOWED_PATH_PATTERN.test( path );

export default () => ( req, res, next ) => {
	if ( ! config.isEnabled( 'redirect-fallback-browsers' ) ) {
		next();
		return;
	}

	// Permitted paths even if the browser is unsupported.
	if ( isAllowedPath( req.path ) ) {
		next();
		return;
	}

	if ( req.cookies.bypass_target_redirection === 'true' ) {
		next();
		return;
	}

	if ( req.query.bypassTargetRedirection === 'true' ) {
		res.cookie( 'bypass_target_redirection', true, {
			expires: new Date( Date.now() + 24 * 3600 * 1000 ), // bypass redirection for 24 hours
			httpOnly: true,
			secure: true,
		} );
		next();
		return;
	}

	const forceRedirect = config.isEnabled( 'redirect-fallback-browsers/test' );
	if ( ! forceRedirect && ! isUnsupportedBrowser( req ) ) {
		next();
		return;
	}

	// `req.originalUrl` contains the full path. It's tempting to use `req.url`, but that would
	// fail in case of multiple Express.js routers nested with `app.use`, because `req.url` contains
	// only the closest subpath.
	const from = req.originalUrl;

	// The UserAgent is automatically included.
	analytics.tracks.recordEvent(
		'calypso_redirect_unsupported_browser',
		{ original_url: from },
		req
	);
	res.redirect( addQueryArgs( { from }, '/browsehappy' ) );
};
