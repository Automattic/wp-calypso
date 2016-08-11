/** @ssr-ready **/

/**
 * External dependencies
 */
import startsWith from 'lodash/startsWith';

/**
 * Check if a URL is located outside of Calypso.
 * Note that the check this function implements is incomplete --
 * it only returns false for absolute URLs, so it misses
 * relative URLs, or pure query strings, or hashbangs.
 *
 * @param {string} url - URL to check
 * @return {bool} true if the given URL is located outside of Calypso
 */
function isOutsideCalypso( url ) {
	return url && ( startsWith( url, '//' ) || ! startsWith( url, '/' ) );
}

function isExternal( url ) {
	return isOutsideCalypso( url ) && ! startsWith( url, '//wordpress.com' );
}

function isHttps( url ) {
	return url && startsWith( url, 'https://' );
}

const urlWithoutHttpRegex = /^https?:\/\//;

/**
 * Returns the supplied URL without the initial http(s).
 * @param  {String}  url The URL to remove http(s) from
 * @return {?String}     URL without the initial http(s)
 */
function withoutHttp( url ) {
	if ( url === '' ) {
		return '';
	}

	if ( ! url ) {
		return null;
	}

	return url.replace( urlWithoutHttpRegex, '' );
}

export default {
	isOutsideCalypso,
	isExternal,
	isHttps,
	withoutHttp
};
