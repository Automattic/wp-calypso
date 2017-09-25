/**
 * External dependencies
 */
import { has, isString, omit, startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import addQueryArgs from 'lib/route/add-query-args';
import { isLegacyRoute } from 'lib/route/legacy-routes';
import { format as formatUrl, parse as parseUrl } from 'url';

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

/**
 * Removes the `http(s)://` part and the trailing slash from an URL.
 * "http://blog.wordpress.com" will be converted into "blog.wordpress.com".
 * "https://www.wordpress.com/blog/" will be converted into "www.wordpress.com/blog".
 *
 * @param  {String} urlToConvert The URL to convert
 * @return {String} The URL's domain and path
 */
function urlToDomainAndPath( urlToConvert ) {
	return withoutHttp( urlToConvert ).replace( /\/$/, '' );
}

/**
 * Checks if the supplied string appears to be a URL.
 * Looks only for the absolute basics:
 *  - does it have a .suffix?
 *  - does it have at least two parts separated by a dot?
 *
 * @param  {String}  query The string to check
 * @return {Boolean} Does it appear to be a URL?
 */
function resemblesUrl( query ) {
	if ( ! query ) {
		return false;
	}

	let parsedUrl = parseUrl( query );

	// Make sure the query has a protocol - hostname ends up blank otherwise
	if ( ! parsedUrl.protocol ) {
		parsedUrl = parseUrl( 'http://' + query );
	}

	if ( ! parsedUrl.hostname || parsedUrl.hostname.indexOf( '.' ) === -1 ) {
		return false;
	}

	// Check for a valid-looking TLD
	if ( parsedUrl.hostname.lastIndexOf( '.' ) > ( parsedUrl.hostname.length - 3 ) ) {
		return false;
	}

	// Make sure the hostname has at least two parts separated by a dot
	const hostnameParts = parsedUrl.hostname.split( '.' ).filter( Boolean );
	if ( hostnameParts.length < 2 ) {
		return false;
	}

	return true;
}

/**
 * Removes given params from a url.
 *
 * @param  {String} url URL to be cleaned
 * @param  {Array|String}  paramsToOmit The collection of params or single param to reject
 * @return {String} Url less the omitted params.
 */
function omitUrlParams( url, paramsToOmit ) {
	if ( ! url ) {
		return null;
	}

	const parsed = parseUrl( url, true );
	parsed.query = omit( parsed.query, paramsToOmit );

	delete parsed.search;
	return formatUrl( parsed );
}

/**
 * Wrap decodeURI in a try / catch block to prevent `URIError` on invalid input
 * Passing a non-string value will return an empty string.
 * @param  {String} encodedURI URI to attempt to decode
 * @return {String}            Decoded URI (or passed in value on error)
 */
function decodeURIIfValid( encodedURI ) {
	if ( ! ( isString( encodedURI ) || has( encodedURI, 'toString' ) ) ) {
		return '';
	}
	try {
		return decodeURI( encodedURI );
	} catch ( e ) {
		return encodedURI;
	}
}

/**
 * Wrap decodeURIComponent in a try / catch block to prevent `URIError` on invalid input
 * Passing a non-string value will return an empty string.
 * @param  {String} encodedURIComponent URI component to attempt to decode
 * @return {String}            Decoded URI component (or passed in value on error)
 */
function decodeURIComponentIfValid( encodedURIComponent ) {
	if ( ! ( isString( encodedURIComponent ) || has( encodedURIComponent, 'toString' ) ) ) {
		return '';
	}
	try {
		return decodeURIComponent( encodedURIComponent );
	} catch ( e ) {
		return encodedURIComponent;
	}
}

export default {
	decodeURIIfValid,
	decodeURIComponentIfValid,
	isOutsideCalypso,
	isExternal,
	isHttps,
	withoutHttp,
	addSchemeIfMissing,
	setUrlScheme,
	urlToSlug,
	urlToDomainAndPath,
	// [TODO]: Move lib/route/add-query-args contents here
	addQueryArgs,
	resemblesUrl,
	omitUrlParams,
};
