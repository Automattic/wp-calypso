/**
 * Internal dependencies
 */

import findThemeFilterTerm from 'state/selectors/find-theme-filter-term';

/**
 * Whether a filter term slug is valid
 *
 * @param  {object}  state Global state tree
 * @param  {string}  term  The term to validate
 * @returns {Bool}          True if term is valid
 */
export default function isValidThemeFilterTerm( state, term ) {
	return !! findThemeFilterTerm( state, term );
}
