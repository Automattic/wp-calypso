/**
 * External dependencies
 */

import photon from 'photon';
import { parse as parseUrl } from 'url';
import { endsWith } from 'lodash';

/**
 * Pattern matching URLs to be left unmodified.
 *
 * @type {RegExp}
 */
let REGEX_EXEMPT_URL;
if ( 'object' === typeof location ) {
	REGEX_EXEMPT_URL = new RegExp( `^(/(?!/)|data:image/[^;]+;|blob:${ location.origin }/)` );
} else {
	REGEX_EXEMPT_URL = /^(\/(?!\/)|data:image\/[^;]+;)/;
}

/**
 * Pattern matching Automattic-controlled hostnames
 *
 * @type {RegExp}
 */
const REGEXP_A8C_HOST = /^([-a-zA-Z0-9_]+\.)*(gravatar\.com|wordpress\.com|wp\.com|a8c\.com)$/;

/**
 * Generate a safe version of the provided URL
 *
 * Images that Calypso uses have to be provided by a trusted TLS host. To do
 * this, we check the host of the URL against a whitelist, and run the image
 * through photon if the host name does not match.
 *
 * NOTE: This function will return `null` for external URLs with query strings,
 * because Photon itself does not support this!
 *
 * @param  {string} url The URL to secure
 * @returns {?string}    The secured URL, or `null` if we couldn't make it safe
 */
export default function safeImageUrl( url ) {
	if ( typeof url !== 'string' ) {
		return null;
	}

	if ( REGEX_EXEMPT_URL.test( url ) ) {
		return url;
	}

	const { hostname, path, query } = parseUrl(
		url,
		/* parseQueryString */ false,
		/* slashesDenoteHost */ true
	);

	if ( REGEXP_A8C_HOST.test( hostname ) ) {
		// Safely promote Automattic domains to HTTPS
		return url.replace( /^http:/, 'https:' );
	}

	// If there's a query string, bail out because Photon doesn't support them on external URLs
	if ( query && query.length > 0 ) {
		return null;
	}

	// Photon doesn't support SVGs
	if ( endsWith( path, '.svg' ) ) {
		return null;
	}

	return photon( url );
}
