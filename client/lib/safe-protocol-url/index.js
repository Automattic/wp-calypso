/**
 * Internal dependencies
 */
import { getUrlParts, getUrlFromParts } from 'calypso/lib/url/url-parts';

export default function safeProtocolUrl( url ) {
	// If it's empty, return null
	if ( null === url || '' === url || 'undefined' === typeof url ) {
		return null;
	}

	// If it's relative, return it
	if ( /^\/[^/]/.test( url ) ) {
		return url;
	}

	const { protocol, host, hash, search, pathname } = getUrlParts( url );

	if ( 'http:' === protocol || 'https:' === protocol ) {
		return url;
	}

	// Handle hostless protocols, such as `javascript:`
	// Preserves the behavior of the previous implementation.
	if ( ! host ) {
		return 'http:';
	}

	return getUrlFromParts( { host, hash, search, pathname, protocol: 'http' } ).href;
}
