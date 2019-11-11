/**
 * External dependencies
 */
import { URL as URLString } from 'types';
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
 * @param  url URL to be cleaned
 * @param  paramsToOmit The collection of params or single param to reject
 * @return Url less the omitted params.
 */
export default function omitUrlParams( url: Falsy, paramsToOmit: string | string[] ): null;
export default function omitUrlParams( url: URLString, paramsToOmit: string | string[] ): URLString;
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

	let toOmit: string[];

	if ( typeof paramsToOmit === 'string' ) {
		toOmit = [ paramsToOmit ];
	} else {
		toOmit = paramsToOmit;
	}

	const parsed = new URL( url, BASE_URL );
	const filtered = Array.from( parsed.searchParams.entries() ).filter(
		( [ key ] ) => ! toOmit || ! toOmit.includes( key )
	);

	const newUrl = new URL( url, BASE_URL );

	if ( urlType !== URL_TYPE.PATH_RELATIVE ) {
		newUrl.search = new URLSearchParams( filtered ).toString();
		return format( newUrl, urlType );
	}

	// Path-relative URLs require special handling, because they cannot be transformed
	// into an absolute URL without potentially losing path information.
	// E.g. `../foo?bar=baz` becomes `<base>/foo?bar=baz` when fed to `new URL()`
	// with a base, losing the traversal into the parent directory.
	// We need to handle these with a string replace instead.
	const newSearch = new URLSearchParams( filtered ).toString();
	if ( parsed.search ) {
		return url.replace( parsed.search, `?${ newSearch }` );
	}

	// The path-relative URL didn't have any params, so we can return it unmodified.
	return url;
}
