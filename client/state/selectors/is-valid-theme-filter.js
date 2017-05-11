/**
 * Internal dependencies
 */
import {
	getThemeFilterTermsTable,
	getThemeFilterTermFromString,
} from 'state/selectors';

/**
 * Checks that a taxonomy:term filter is valid, using the theme
 * taxonomy data.
 *
 * @param {string} state Global state tree
 * @param {string} filter Filter in form taxonomy:term
 * @return {boolean} true if filter pair is valid
 */
export default function isValidThemeFilter( state, filter ) {
	const termsTable = getThemeFilterTermsTable( state );
	const term = getThemeFilterTermFromString( state, filter );
	const taxonomy = filter.split( ':' )[ 0 ];

	return termsTable[ term ] === taxonomy;
}
