/** @format */

/**
 * External dependencies
 */

import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import { getThemeFilterTermsTable } from 'state/selectors';

/**
 * Given the 'term' part, returns a complete filter
 * in "taxonomy:term" search-box format.
 *
 * Supplied terms that belong to more than one taxonomy must be
 * prefixed taxonomy:term
 *
 * @param {Object} state Global state tree
 * @param {string} term The term slug
 * @return {string} Complete taxonomy:term filter, or empty string if term is not valid
 */
export default function getThemeFilterStringFromTerm( state, term ) {
	const terms = getThemeFilterTermsTable( state );
	const taxonomy = terms[ term ];

	if ( taxonomy ) {
		if ( includes( term, ':' ) ) {
			return term;
		}
		return `${ taxonomy }:${ term }`;
	}

	return '';
}
