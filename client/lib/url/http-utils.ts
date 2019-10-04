/**
 * Internal dependencies
 */
import { URL as URLType, SiteSlug } from 'types';
import { Falsey } from 'utility-types';

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
