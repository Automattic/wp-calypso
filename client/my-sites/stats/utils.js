import { getUrlParts } from '@automattic/calypso-url';
import page from 'page';
import { parse as parseQs, stringify as stringifyQs } from 'qs';

/**
 * Update query for current page or passed in URL
 * @param {Object} query query object
 * @param {string} path full or partial URL. pathname and search required
 * @returns pathname concatenated with query string
 */
export function getPathWithUpdatedQueryString( query = {}, path = page.current ) {
	const parsedUrl = getUrlParts( path );
	let search = parsedUrl.search;
	const pathname = parsedUrl.pathname;

	// HACK: page.js adds a `?...page=stats...` query param to the URL in Odyssey on page refresh everytime.
	// Test whether there are two query strings (two '?').
	if ( search.replaceAll( /[^?]/g, '' ).length > 1 ) {
		// If so, we remove the last '?' and the query string following it with the lazy match regex.
		search = search?.replace( /(\?[^?]*)\?.*$/, '$1' );
	}

	const updatedSearch = {
		...parseQs( search.substring( 1 ), { parseArrays: false } ),
		...query,
	};

	const updatedSearchString = stringifyQs( updatedSearch );
	if ( ! updatedSearchString ) {
		return pathname;
	}

	return `${ pathname }?${ updatedSearchString }`;
}
