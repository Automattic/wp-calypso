import config from '@automattic/calypso-config';
import isDevEnvironment from 'calypso/lib/config/is-dev-environment';
import { isLegacyRoute } from 'calypso/lib/route/legacy-routes';
import { URL as URLString } from 'calypso/types';

// Base URL used for URL parsing. The WHATWG URL API doesn't support relative
// URLs, so we always need to provide a base of some sort.
const BASE_HOSTNAME = 'base.invalid';
const BASE_URL = `http://${ BASE_HOSTNAME }`;

export default function isExternal( url: URLString ): boolean {
	// While TypeScript should ensure that `url` really is a string, this method
	// is still used in a lot of JavaScript contexts, without type checks.
	if ( ! url && url !== '' ) {
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
		return false;
	}
	const { hostname, pathname } = parsedUrl;

	// Did we parse a relative URL?
	if ( hostname === BASE_HOSTNAME ) {
		return false;
	}

	// Legacy routes (e.g. /support) are served outside Calypso even when the
	// hostname matches — treat them as external.
	const hasLegacyPath = pathname && isLegacyRoute( pathname.replace( '//', '/' ) );

	if ( typeof window !== 'undefined' ) {
		if ( hostname === window.location.hostname ) {
			return Boolean( hasLegacyPath );
		}
	}

	// On Calypso Live and dev environments, treat production wordpress.com
	// routes as internal so sidebar links stay within the testing environment.
	if ( isDevEnvironment() && hostname === 'wordpress.com' ) {
		return Boolean( hasLegacyPath );
	}

	return hostname !== config( 'hostname' );
}
