/**
 * External dependencies
 */
import url from 'url';
import { trim } from 'lodash';

export function suggestDomainFromImportUrl( siteUrl: string ): string | null {
	const parsedUrl = url.parse( siteUrl, false, true );
	const parsedHostname = parsedUrl.hostname ? parsedUrl.hostname.split( '.' ) : null;
	const pathname = parsedUrl.pathname ? trim( parsedUrl.pathname, '/' ) : null;

	// Site name is sometimes the path, as in the case of Wix and Medium sites,
	// such as `medium.com/my-blog`
	if ( pathname ) {
		return pathname.replace( '/', '-' );
	}

	// Other services use a subdomain, like `example.wordpress.com.
	if ( parsedHostname && parsedHostname.length > 2 ) {
		return parsedHostname[ 0 ];
	}

	// Otherwise, just return the hostname (domain and tld).
	if ( parsedUrl.hostname ) {
		return parsedUrl.hostname;
	}

	return null;
}
