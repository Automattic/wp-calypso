import { getThemeFilterStringFromTerm } from 'calypso/state/themes/selectors/get-theme-filter-string-from-term';

import 'calypso/state/themes/init';

/**
 * For a string of terms, recreate full search string in
 * "taxonomy:term taxonomy:term " search-box format, with
 * a trailing space.
 * @param {Object} state Global state tree
 * @param {string} terms Space or + separated list of filter terms
 * @param {Array[string]} excludeTaxonomies List of taxonomies to exclude
 * @param {Array[string]} includedTaxonomies List of taxonomies to include
 * @returns {string} Complete taxonomy:term filter string, or empty string if term is not valid
 */
export function prependThemeFilterKeys(
	state,
	terms = '',
	excludeTaxonomies = Array(),
	includedTaxonomies = Array()
) {
	const result = terms
		.split( /[+\s]/ )
		.map( ( term ) =>
			getThemeFilterStringFromTerm( state, term, excludeTaxonomies, includedTaxonomies )
		)
		.join( ' ' )
		.trim();

	if ( result ) {
		return result + ' ';
	}
	return '';
}
