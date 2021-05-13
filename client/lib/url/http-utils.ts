/**
 * Internal dependencies
 */
import { URL as TypedURL, SiteSlug } from 'calypso/types';
import { Falsy } from 'utility-types';

const urlWithoutHttpRegex = /^https?:\/\//;

/**
 * Returns the supplied URL without the initial http(s).
 * @param  url The URL to remove http(s) from
 * @returns     URL without the initial http(s)
 */
export function withoutHttp( url: '' ): '';
export function withoutHttp( url: Falsy ): null;
export function withoutHttp( url: TypedURL ): TypedURL;
export function withoutHttp( url: TypedURL | Falsy ): TypedURL | null {
	if ( url === '' ) {
		return '';
	}

	if ( ! url ) {
		return null;
	}

	return url.replace( urlWithoutHttpRegex, '' );
}

export function urlToSlug( url: Falsy ): null;
export function urlToSlug( url: TypedURL ): SiteSlug;
export function urlToSlug( url: TypedURL | Falsy ): SiteSlug | null {
	if ( ! url ) {
		return null;
	}

	return withoutHttp( url ).replace( /\//g, '::' );
}

/**
 * Removes the `http(s)://` part and the trailing slash from a URL.
 * "http://blog.wordpress.com" will be converted into "blog.wordpress.com".
 * "https://www.wordpress.com/blog/" will be converted into "www.wordpress.com/blog".
 *
 * @param  urlToConvert The URL to convert
 * @returns              The URL's domain and path
 */
export function urlToDomainAndPath( urlToConvert: TypedURL ): TypedURL {
	return withoutHttp( urlToConvert ).replace( /\/$/, '' );
}
