/**
 * Internal dependencies
 */
import { getThemeFilterStringFromTerm } from 'state/themes/selectors/get-theme-filter-string-from-term';

import 'state/themes/init';

/**
 * For a string of terms, recreate full search string in
 * "taxonomy:term taxonomy:term " search-box format, with
 * a trailing space.
 *
 * @param {object} state Global state tree
 * @param {string} terms Space or + separated list of filter terms
 * @returns {string} Complete taxonomy:term filter string, or empty string if term is not valid
 */
export function prependThemeFilterKeys( state, terms = '' ) {
	const result = terms
		.split( /[+\s]/ )
		.map( ( term ) => getThemeFilterStringFromTerm( state, term ) )
		.join( ' ' )
		.trim();

	if ( result ) {
		return result + ' ';
	}
	return '';
}
