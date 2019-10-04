/**
 * Internal dependencies
 */
import { URL as URLType } from 'types';
import { Falsey } from 'utility-types';

/**
 * Removes given params from a url.
 *
 * @param  url URL to be cleaned
 * @param  paramsToOmit The collection of params or single param to reject
 * @return Url less the omitted params.
 */
export default function omitUrlParams( url: Falsey, paramsToOmit: string | string[] ): null;
export default function omitUrlParams( url: URLType, paramsToOmit: string | string[] ): URLType;
export default function omitUrlParams(
	url: URLType | Falsey,
	paramsToOmit: string | string[]
): URLType | null {
	if ( ! url ) {
		return null;
	}

	let toOmit: string[];

	if ( typeof paramsToOmit === 'string' ) {
		toOmit = [ paramsToOmit as string ];
	} else {
		toOmit = paramsToOmit;
	}

	const parsed = new URL( url );
	const filtered = Array.from( parsed.searchParams.entries() ).filter(
		( [ key ] ) => ! toOmit || ! toOmit.includes( key )
	);

	const newUrl = new URL( url );
	newUrl.search = new URLSearchParams( filtered ).toString();

	return newUrl.href;
}
