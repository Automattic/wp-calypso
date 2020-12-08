/**
 * External dependencies
 */
import { URL as URLString } from 'calypso/types';
import { Falsy } from 'utility-types';

/**
 * Internal dependencies
 */
import { determineUrlType, URL_TYPE } from './url-type';
import format from './format';

const BASE_URL = 'http://__domain__.invalid';

/**
 * Removes given params from a url.
 *
 * @param   url URL to be cleaned
 * @param   paramsToOmit The collection of params or single param to reject
 * @returns Url less the omitted params.
 */
export default function omitUrlParams( url: Falsy, paramsToOmit: string | string[] ): null;
export default function omitUrlParams(
	url: URLString,
	paramsToOmit: string | string[]
): URLString | null;
export default function omitUrlParams(
	url: URLString | Falsy,
	paramsToOmit: string | string[]
): URLString | null {
	if ( ! url ) {
		// Note that we return null for the valid empty string URL.
		// This is done to maintain compatibility with the previous implementation.
		return null;
	}

	const urlType = determineUrlType( url );

	if ( urlType === URL_TYPE.INVALID ) {
		return null;
	}

	// An empty string or array of paramsToOmit is a no-op (with a valid URL).
	if ( ! paramsToOmit || ! paramsToOmit.length ) {
		return url;
	}

	const toOmit: string[] = typeof paramsToOmit === 'string' ? [ paramsToOmit ] : paramsToOmit;

	const parsed = new URL( url, BASE_URL );
	const filtered = Array.from( parsed.searchParams.entries() ).filter(
		( [ key ] ) => ! toOmit.includes( key )
	);

	const newUrl = new URL( url, BASE_URL );
	const newSearch = new URLSearchParams( filtered ).toString();

	if ( urlType !== URL_TYPE.PATH_RELATIVE ) {
		newUrl.search = newSearch;
		return format( newUrl, urlType );
	}

	// Path-relative URLs require special handling, because they cannot be transformed
	// into an absolute URL without potentially losing path information.
	// E.g. `../foo?bar=baz` becomes `<base>/foo?bar=baz` when fed to `new URL()`
	// with a base, losing the traversal into the parent directory.
	// We need to handle these with a string replace instead.
	if ( parsed.search ) {
		return url.replace( parsed.search, `?${ newSearch }` );
	}

	// The path-relative URL didn't have any params, so we can return it unmodified.
	return url;
}
