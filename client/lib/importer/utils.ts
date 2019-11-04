/**
 * External dependencies
 */
import url from 'url';
import { trim } from 'lodash';

export function suggestDomainFromImportUrl( siteUrl: string ): string | null {
	const parsedUrl = url.parse( siteUrl, false, true );
	const pathname = parsedUrl.pathname ? trim( parsedUrl.pathname, '/' ) : null;
	const useSubdomainMatchers = [
		/wordpress\.com\/?$/,
		/\.blogspot\./,
		/godaddysites\.com\/?$/,
		/squarespace\.com\/?$/,
		/tumblr\.com\/?$/,
	];
	const usePathMatchers = [ /wixsite\.com\/?$/, /medium\.com\/?$/ ];

	// Site name is sometimes the path, as in the case of Wix and Medium sites,
	// such as `medium.com/my-blog`.
	if ( pathname ) {
		for ( const pathMatcher of usePathMatchers ) {
			if ( parsedUrl.hostname.match( pathMatcher ) ) {
				return pathname.replace( '/', '-' );
			}
		}
	}

	if ( parsedUrl.hostname ) {
		// Other services use a subdomain, like `example.wordpress.com`,
		// return only the subdomain.
		for ( const matcher of useSubdomainMatchers ) {
			if ( parsedUrl.hostname.match( matcher ) ) {
				return parsedUrl.hostname.split( '.' )[ 0 ];
			}
		}

		// Otherwise, return the full hostname.
		return parsedUrl.hostname;
	}

	return null;
}
