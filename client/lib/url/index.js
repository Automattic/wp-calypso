/** @ssr-ready **/

/**
 * External dependencies
 */
import { parse as parseUrl } from 'url';
import startsWith from 'lodash/startsWith';

/**
 * Internal dependencies
 */
import config from 'config';
import addQueryArgs from 'lib/route/add-query-args';

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
	const { hostname } = parseUrl( url, false, true ); // no qs needed, and slashesDenoteHost to handle protocol-relative URLs

	if ( ! hostname ) {
		return false;
	}

	if ( typeof window !== 'undefined' ) {
		return hostname !== window.location.hostname;
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
