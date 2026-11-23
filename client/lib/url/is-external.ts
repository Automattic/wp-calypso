import config from '@automattic/calypso-config';
import { isLegacyRoute } from 'calypso/lib/route/legacy-routes';
import { URL as URLString } from 'calypso/types';

// Base URL used for URL parsing. The WHATWG URL API doesn't support relative
// URLs, so we always need to provide a base of some sort.
const BASE_HOSTNAME = 'base.invalid';
const BASE_URL = `http://${ BASE_HOSTNAME }`;

function getAbsoluteProtocol( url: string ) {
	try {
		return new URL( url ).protocol;
	} catch {
		return null;
	}
}

export default function isExternal( url: URLString ): boolean {
	// While TypeScript should ensure that `url` really is a string, this method
	// is still used in a lot of JavaScript contexts, without type checks.
	if ( ! url && url !== '' ) {
		return true;
	}

	if ( url === '' ) {
		return false;
	}

	// `javascript:x='@example.com/'` reads as a host after the `//` below, so check the scheme
	// as the browser will parse it first.
	if ( ! [ 'http:', 'https:', null ].includes( getAbsoluteProtocol( url ) ) ) {
		return true;
	}

	// The url passed in might be of form `wordpress.com/support`,
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

	let parsedUrl;
	try {
		parsedUrl = new URL( url, BASE_URL );
	} catch {
		return true;
	}
	const { hostname, pathname } = parsedUrl;

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
