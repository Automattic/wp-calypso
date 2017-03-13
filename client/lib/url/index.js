/**
 * External dependencies
 */
import { parse as parseUrl } from 'url';
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import addQueryArgs from 'lib/route/add-query-args';
import { isLegacyRoute } from 'lib/route/legacy-routes';

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
	// parseURL will return hostname = null if no protocol or double-slashes
	// the url passed in might be of form `en.support.wordpress.com`
	// so for this function we'll append double-slashes to fake it
	// if it is a relative URL the hostname will still be empty from parseURL
	if ( ! startsWith( url, 'http://' ) && ! startsWith( url, 'https://' ) && ! startsWith( url, '//' ) ) {
		url = '//' + url;
	}

	const { hostname, path } = parseUrl( url, false, true ); // no qs needed, and slashesDenoteHost to handle protocol-relative URLs

	if ( ! hostname ) {
		return false;
	}

	if ( typeof window !== 'undefined' ) {
		if ( hostname === window.location.hostname ) {
			// even if hostname matches, the url might be outside calypso
			// outside calypso should be considered external
			// double separators are valid paths - but not handled correctly
			if ( path && isLegacyRoute( path.replace( '//', '/' ) ) ) {
				return true;
			}
			return false;
		}
	}

	return hostname !== config( 'hostname' );
}

function isHttps( url ) {
	return url && startsWith( url, 'https://' );
}

const schemeRegex = /^\w+:\/\//;
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

function addSchemeIfMissing( url, scheme ) {
	if ( false === schemeRegex.test( url ) ) {
		return scheme + '://' + url;
	}
	return url;
}

function setUrlScheme( url, scheme ) {
	const schemeWithSlashes = scheme + '://';
	if ( startsWith( url, schemeWithSlashes ) ) {
		return url;
	}

	const newUrl = addSchemeIfMissing( url, scheme );
	if ( newUrl !== url ) {
		return newUrl;
	}

	return url.replace( schemeRegex, schemeWithSlashes );
}

function urlToSlug( url ) {
	if ( ! url ) {
		return null;
	}

	return withoutHttp( url ).replace( /\//g, '::' );
}

export default {
	isOutsideCalypso,
	isExternal,
	isHttps,
	withoutHttp,
	addSchemeIfMissing,
	setUrlScheme,
	urlToSlug,
	// [TODO]: Move lib/route/add-query-args contents here
	addQueryArgs
};
