/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/inline-help/init';

/**
 * Returns an array of all search results for a given search query or `null`
 * if there are no results for that query.
 *
 * @param  {object}  state  Global state tree.
 * @param  {number}  searchQuery Search query.
 * @returns {?Array} List of results for a given search query.
 */
export default function getInlineHelpSearchResultsForQuery( state, searchQuery ) {
	const allResults = get( state, 'inlineHelp.searchResults.search.items' );
	return get( allResults, [ searchQuery ], [] );
}
