/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/inline-help/init';
import getSearchQuery from 'calypso/state/inline-help/selectors/get-search-query';

/**
 * Returns an array of all search results for the current search query or an
 * empty array if there are no results for that query.
 *
 * @param  {object}  state  Global state tree.
 * @returns {Array} List of results for a given search query.
 */

export default function getInlineHelpSearchResultsForQuery( state ) {
	const searchQuery = getSearchQuery( state );
	const allResults = get( state, 'inlineHelp.searchResults.search.items' );
	return get( allResults, [ searchQuery ], [] );
}
