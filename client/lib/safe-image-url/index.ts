/**
 * External dependencies
 */
import photon from 'photon';

/**
 * Internal dependencies
 */
import { getUrlParts } from 'lib/url/url-parts';

/**
 * Pattern matching URLs to be left unmodified.
 *
 * @type {RegExp}
 */
let REGEX_EXEMPT_URL : RegExp;
if ( typeof globalThis.location === 'object' ) {
	REGEX_EXEMPT_URL = new RegExp(
		`^(/(?!/)|data:image/[^;]+;|blob:${ globalThis.location.origin }/)`
	);
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
export default function safeImageUrl( url : string, safeDomains? : string[] ) : string | null {
	if ( typeof url !== 'string' ) {
		return null;
	}

	if ( REGEX_EXEMPT_URL.test( url ) ) {
		return url;
	}

	const { hostname, pathname, search } = getUrlParts( url );

	if ( REGEXP_A8C_HOST.test( hostname ) || safeDomains?.indexOf( hostname ) !== -1 ) {
		// Safely promote Automattic and whitelisted domains to HTTPS
		return url.replace( /^http:/, 'https:' );
	}

	// If there's a query string, bail out because Photon doesn't support them on external URLs
	if ( search ) {
		return null;
	}

	// Photon doesn't support SVGs
	if ( pathname.endsWith( '.svg' ) ) {
		return null;
	}

	return photon( url );
}
