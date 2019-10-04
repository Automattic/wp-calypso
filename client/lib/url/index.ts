/**
 * Internal dependencies
 */
import config from 'config';
import { isLegacyRoute } from 'lib/route/legacy-routes';
import { URL as URLType, SiteSlug, Scheme } from 'types';
import { Falsey } from 'utility-types';

export { addQueryArgs } from 'lib/route';

// Base URL used for URL parsing. The WHATWG URL API doesn't support relative
// URLs, so we always need to provide a base of some sort.
const BASE_HOSTNAME = 'base.invalid';
const BASE_URL = `http://${ BASE_HOSTNAME }`;

interface Stringable {
	toString: () => string;
}

/**
 * Check if a URL is located outside of Calypso.
 * Note that the check this function implements is incomplete --
 * it only returns false for absolute URLs, so it misses
 * relative URLs, or pure query strings, or hashbangs.
 *
 * @param  url URL to check
 * @return     true if the given URL is located outside of Calypso
 */
export function isOutsideCalypso( url: URLType ): boolean {
	return !! url && ( url.startsWith( '//' ) || ! url.startsWith( '/' ) );
}

export function isExternal( url: URLType ): boolean {
	// The url passed in might be of form `en.support.wordpress.com`,
	// so for this function we'll append double-slashes to fake it.
	// If it is a relative URL the hostname will be the base hostname.
	if (
		! url.startsWith( 'http://' ) &&
		! url.startsWith( 'https://' ) &&
		! url.startsWith( '/' ) &&
		! url.startsWith( '?' ) &&
		! url.startsWith( '#' )
	) {
		url = '//' + url;
	}

	const { hostname, pathname } = new URL( url, BASE_URL );

	// Did we parse a relative URL?
	if ( hostname === BASE_HOSTNAME ) {
		return false;
	}

	if ( typeof window !== 'undefined' ) {
		if ( hostname === window.location.hostname ) {
			// even if hostname matches, the url might be outside calypso
			// outside calypso should be considered external
			// double separators are valid paths - but not handled correctly
			if ( pathname && isLegacyRoute( pathname.replace( '//', '/' ) ) ) {
				return true;
			}
			return false;
		}
	}

	return hostname !== config( 'hostname' );
}

export function isHttps( url: URLType ): boolean {
	return !! url && url.startsWith( 'https://' );
}

const schemeRegex = /^\w+:\/\//;
const urlWithoutHttpRegex = /^https?:\/\//;

/**
 * Returns the supplied URL without the initial http(s).
 * @param  url The URL to remove http(s) from
 * @return     URL without the initial http(s)
 */
export function withoutHttp( url: '' ): '';
export function withoutHttp( url: Falsey ): null;
export function withoutHttp( url: URLType ): URLType;
export function withoutHttp( url: URLType | Falsey ): URLType | null {
	if ( url === '' ) {
		return '';
	}

	if ( ! url ) {
		return null;
	}

	return url.replace( urlWithoutHttpRegex, '' );
}

export function addSchemeIfMissing( url: URLType, scheme: Scheme ): URLType {
	if ( false === schemeRegex.test( url ) ) {
		return scheme + '://' + url;
	}
	return url;
}

export function setUrlScheme( url: URLType, scheme: Scheme ) {
	const schemeWithSlashes = scheme + '://';
	if ( url && url.startsWith( schemeWithSlashes ) ) {
		return url;
	}

	const newUrl = addSchemeIfMissing( url, scheme );
	if ( newUrl !== url ) {
		return newUrl;
	}

	return url.replace( schemeRegex, schemeWithSlashes );
}

export function urlToSlug( url: Falsey ): null;
export function urlToSlug( url: URLType ): SiteSlug;
export function urlToSlug( url: URLType | Falsey ): SiteSlug | null {
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
 * @param  urlToConvert The URL to convert
 * @return              The URL's domain and path
 */
export function urlToDomainAndPath( urlToConvert: URLType ): URLType {
	return withoutHttp( urlToConvert ).replace( /\/$/, '' );
}

/**
 * Checks if the supplied string appears to be a URL.
 * Looks only for the absolute basics:
 *  - does it have a .suffix?
 *  - does it have at least two parts separated by a dot?
 *
 * @param  query The string to check
 * @return       Does it appear to be a URL?
 */
export function resemblesUrl( query: string ): boolean {
	if ( ! query ) {
		return false;
	}

	let parsedUrl;
	try {
		parsedUrl = new URL( query );
	} catch {
		// Do nothing.
	}

	// If we got an invalid URL, add a protocol and try again.
	if ( parsedUrl === undefined ) {
		try {
			parsedUrl = new URL( 'http://' + query );
		} catch {
			// Do nothing.
		}
	}

	if ( ! parsedUrl ) {
		return false;
	}

	if ( ! parsedUrl.hostname || parsedUrl.hostname.indexOf( '.' ) === -1 ) {
		return false;
	}

	// Check for a valid-looking TLD
	if ( parsedUrl.hostname.lastIndexOf( '.' ) > parsedUrl.hostname.length - 3 ) {
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
 * @param  url URL to be cleaned
 * @param  paramsToOmit The collection of params or single param to reject
 * @return Url less the omitted params.
 */
export function omitUrlParams( url: Falsey, paramsToOmit: string | string[] ): null;
export function omitUrlParams( url: URLType, paramsToOmit: string | string[] ): URLType;
export function omitUrlParams(
	url: URLType | Falsey,
	paramsToOmit: string | string[]
): URLType | null {
	if ( ! url ) {
		return null;
	}

	let toOmit: string[];

	if ( typeof paramsToOmit === 'string' ) {
		toOmit = [ paramsToOmit as string ];
	} else {
		toOmit = paramsToOmit;
	}

	const parsed = new URL( url );
	const filtered = Array.from( parsed.searchParams.entries() ).filter(
		( [ key ] ) => ! toOmit || ! toOmit.includes( key )
	);

	const newUrl = new URL( url );
	newUrl.search = new URLSearchParams( filtered ).toString();

	return newUrl.href;
}

/**
 * Wrap decodeURI in a try / catch block to prevent `URIError` on invalid input
 * Passing a non-string value will return an empty string.
 * @param  encodedURI URI to attempt to decode
 * @return            Decoded URI (or passed in value on error)
 */
export function decodeURIIfValid( encodedURI: string | Stringable ): URLType {
	let encodedURIString: string;

	if ( encodedURI as Stringable ) {
		encodedURIString = encodedURI.toString();
	} else {
		encodedURIString = encodedURI as string;
	}

	if ( typeof encodedURIString !== 'string' ) {
		return '';
	}

	try {
		return decodeURI( encodedURIString );
	} catch ( e ) {
		return encodedURIString;
	}
}

/**
 * Wrap decodeURIComponent in a try / catch block to prevent `URIError` on invalid input
 * Passing a non-string value will return an empty string.
 * @param  encodedURIComponent URI component to attempt to decode
 * @return                     Decoded URI component (or passed in value on error)
 */
export function decodeURIComponentIfValid( encodedURIComponent: string | Stringable ): string {
	let encodedURIComponentString: string;

	if ( encodedURIComponent as Stringable ) {
		encodedURIComponentString = encodedURIComponent.toString();
	} else {
		encodedURIComponentString = encodedURIComponent as string;
	}

	if ( typeof encodedURIComponentString !== 'string' ) {
		return '';
	}

	try {
		return decodeURIComponent( encodedURIComponentString );
	} catch ( e ) {
		return encodedURIComponentString;
	}
}
