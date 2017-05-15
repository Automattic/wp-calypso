/**
 * External dependencies
 */
import { curry } from 'lodash';

/**
 * Internal dependencies
 */
import { getThemeFilterStringFromTerm } from 'state/selectors';

/**
 * For array of terms recreate full search string in
 * "taxonomy:term taxonomy:term" search-box format.
 *
 * @param {Object} state Global state tree
 * @param {string} terms Space or + separated list of filter terms
 * @return {string} Complete taxonomy:term filter string, or empty string if term is not valid
 */
export default function prependThemeFilterKeys( state, terms ) {
	const getFilter = curry( getThemeFilterStringFromTerm )( state );
	if ( terms ) {
		return terms.split( /[+\s]/ ).map( getFilter ).join( ' ' ) + ' ';
	}
	return '';
}
