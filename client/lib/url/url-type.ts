/**
 * External dependencies
 */
import { URL as URLString } from 'types';
import { Falsey } from 'utility-types';

// For complete definitions of these classifications, see:
// https://url.spec.whatwg.org/#urls
export enum URL_TYPE {
	// A complete URL, with (at least) protocol and host.
	// E.g. `http://example.com` or `http://example.com/path`
	ABSOLUTE = 'ABSOLUTE',
	// A URL with no protocol, but with a host.
	// E.g. `//example.com` or `//example.com/path`
	SCHEME_RELATIVE = 'SCHEME_RELATIVE',
	// A URL with no protocol or host, but with a path starting at the root.
	// E.g. `/` or `/path`
	PATH_ABSOLUTE = 'PATH_ABSOLUTE',
	// A URL with no protocol or host, but with a path relative to the current resource.
	// E.g. `../foo` or `bar`
	PATH_RELATIVE = 'PATH_RELATIVE',
	// Any invalid URL.
	// E.g. `///`
	INVALID = 'INVALID',
}

const BASE_HOSTNAME = '__domain__.invalid';
const BASE_URL = `http://${ BASE_HOSTNAME }`;

/**
 * Determine the type of a URL, with regards to its completeness.
 * @param url the URL to analyze
 *
 * @returns the type of the URL
 */
export function determineUrlType( url: URLString | URL | Falsey ): URL_TYPE {
	// As a URL, the empty string means "the current resource".
	if ( url === '' ) {
		return URL_TYPE.PATH_RELATIVE;
	}

	// Any other falsey value is an invalid URL.
	if ( ! url ) {
		return URL_TYPE.INVALID;
	}

	// The native URL object can only represent absolute URLs.
	if ( url instanceof URL ) {
		return URL_TYPE.ABSOLUTE;
	}

	let parsed;

	try {
		// If we can parse the URL without a base, it's an absolute URL.
		parsed = new URL( url );
		return URL_TYPE.ABSOLUTE;
	} catch ( e ) {
		// Do nothing.
	}

	try {
		parsed = new URL( url, BASE_URL );
	} catch ( e ) {
		// If it can't be parsed even with a base URL, it's an invalid URL.
		return URL_TYPE.INVALID;
	}

	// If we couldn't parse it without a base, but it didn't take the hostname we provided, that means
	// it's a protocol-relative URL.
	if ( parsed.hostname !== BASE_HOSTNAME ) {
		return URL_TYPE.SCHEME_RELATIVE;
	}

	// Otherwise, it's a relative URL of some sort.
	if ( url.startsWith( '/' ) ) {
		return URL_TYPE.PATH_ABSOLUTE;
	}
	return URL_TYPE.PATH_RELATIVE;
}
