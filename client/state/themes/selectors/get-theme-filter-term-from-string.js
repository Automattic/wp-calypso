/**
 * Internal dependencies
 */
import { isAmbiguousThemeFilterTerm } from 'calypso/state/themes/selectors/is-ambiguous-theme-filter-term';

import 'calypso/state/themes/init';

/**
 * return term from a taxonomy:term string
 *
 * @param {object} state Global state tree
 * @param {string} filter taxonomy:term string
 * @returns {string} The term part, or full string if term is ambiguous
 */
export function getThemeFilterTermFromString( state, filter ) {
	const term = filter.split( ':' )[ 1 ];
	if ( isAmbiguousThemeFilterTerm( state, term ) ) {
		return filter;
	}
	return term;
}
