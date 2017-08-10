/** @format */
/**
 * Internal dependencies
 */
import { isAmbiguousThemeFilterTerm } from 'state/selectors';

/**
 * return term from a taxonomy:term string
 *
 * @param {Object} state Global state tree
 * @param {string} filter taxonomy:term string
 * @return {string} The term part, or full string if term is ambiguous
 */
export default function getThemeFilterTermFromString( state, filter ) {
	const term = filter.split( ':' )[ 1 ];
	if ( isAmbiguousThemeFilterTerm( state, term ) ) {
		return filter;
	}
	return term;
}
