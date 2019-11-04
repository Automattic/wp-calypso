/**
 * External dependencies
 */
import { format as formatUrl, parse as parseUrl } from 'url';
import { has, isString, omit } from 'lodash';

/**
 * Internal dependencies
 */
import { URL } from 'types';
import { Falsy } from 'utility-types';

/**
 * Re-exports
 */
export { addQueryArgs } from 'lib/route';
export { withoutHttp, urlToSlug, urlToDomainAndPath } from './http-utils';
export { default as isExternal } from './is-external';
export { default as resemblesUrl } from './resembles-url';
export { URL_TYPE, determineUrlType } from './url-type';
export { default as isOutsideCalypso } from './is-outside-calypso';
export { default as isHttps } from './is-https';
export { addSchemeIfMissing, setUrlScheme } from './scheme-utils';

/**
 * Removes given params from a url.
 *
 * @param  {String} url URL to be cleaned
 * @param  {Array|String}  paramsToOmit The collection of params or single param to reject
 * @return {String} Url less the omitted params.
 */
export function omitUrlParams( url: Falsy, paramsToOmit: string | string[] ): null;
export function omitUrlParams( url: URL, paramsToOmit: string | string[] ): URL;
export function omitUrlParams( url: URL | Falsy, paramsToOmit: string | string[] ): URL | null {
	if ( ! url ) {
		return null;
	}

	const parsed = parseUrl( url, true );
	parsed.query = omit( parsed.query, paramsToOmit );

	delete parsed.search;
	return formatUrl( parsed );
}

/**
 * Wrap decodeURI in a try / catch block to prevent `URIError` on invalid input
 * Passing a non-string value will return an empty string.
 * @param  encodedURI URI to attempt to decode
 * @return            Decoded URI (or passed in value on error)
 */
export function decodeURIIfValid( encodedURI: string ): URL {
	if ( ! ( isString( encodedURI ) || has( encodedURI, 'toString' ) ) ) {
		return '';
	}
	try {
		return decodeURI( encodedURI );
	} catch ( e ) {
		return encodedURI;
	}
}

/**
 * Wrap decodeURIComponent in a try / catch block to prevent `URIError` on invalid input
 * Passing a non-string value will return an empty string.
 * @param  encodedURIComponent URI component to attempt to decode
 * @return                     Decoded URI component (or passed in value on error)
 */
export function decodeURIComponentIfValid( encodedURIComponent: string ): string {
	if ( ! ( isString( encodedURIComponent ) || has( encodedURIComponent, 'toString' ) ) ) {
		return '';
	}
	try {
		return decodeURIComponent( encodedURIComponent );
	} catch ( e ) {
		return encodedURIComponent;
	}
}
