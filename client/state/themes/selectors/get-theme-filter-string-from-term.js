import { includes } from 'lodash';
import { getThemeFilterTermsTable } from 'calypso/state/themes/selectors/get-theme-filter-terms-table';

import 'calypso/state/themes/init';

/**
 * Given the 'term' part, returns a complete filter
 * in "taxonomy:term" search-box format.
 *
 * Supplied terms that belong to more than one taxonomy must be
 * prefixed taxonomy:term
 * @param {Object} state Global state tree
 * @param {string} term The term slug
 * @param {Array[string]} excludedTaxonomies List of taxonomies to exclude
 * @param {Array[string]} includedTaxonomies List of taxonomies to include
 * @returns {string} Complete taxonomy:term filter, or empty string if term is not valid
 */
export function getThemeFilterStringFromTerm(
	state,
	term,
	excludedTaxonomies = [],
	includedTaxonomies = []
) {
	const terms = getThemeFilterTermsTable( state );
	const taxonomy = terms[ term ];

	if ( excludedTaxonomies.includes( taxonomy ) ) {
		return '';
	}

	if ( includedTaxonomies.length > 0 && ! includedTaxonomies.includes( taxonomy ) ) {
		return '';
	}

	if ( taxonomy ) {
		if ( includes( term, ':' ) ) {
			return term;
		}
		return `${ taxonomy }:${ term }`;
	}

	return '';
}
