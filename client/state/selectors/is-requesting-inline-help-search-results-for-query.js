/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if currently requesting search results for a given query; false
 * otherwise.
 *
 * @param  {object}  state       Global state tree
 * @param  {number}  searchQuery Search query
 * @returns {boolean}            Whether search results are being requested
 */
export default function isRequestingInlineHelpSearchResultsForQuery( state, searchQuery ) {
	const allRequesting = get( state, 'inlineHelp.searchResults.requesting' );
	return !! get( allRequesting, [ searchQuery ] );
}
