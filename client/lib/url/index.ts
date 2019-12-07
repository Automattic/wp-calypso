/**
 * External dependencies
 */
import { format as formatUrl, parse as parseUrl } from 'url';
import { omit } from 'lodash';

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
export { decodeURIIfValid, decodeURIComponentIfValid } from './decode-utils';
export { default as format } from './format';

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
