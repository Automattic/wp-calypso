/**
 * Returns the current search query.
 *
 * @param  {Object}  state  Global state tree
 * @return {String}        The current search query
 */
export function getSearchQuery( state ) {
	return state.inlineHelpSearchResults.search.searchQuery || '';
}

/**
 * Returns the index of the currently selected search result.
 *
 * @param  {Object}  state  Global state tree
 * @return {String}        The index of the currently selected search result
 */
export function getSelectedResult( state ) {
	return state.inlineHelpSearchResults.search.selectedResult;
}

/**
 * Returns whether we should open the currently selected search result.
 *
 * @param  {Object}  state  Global state tree
 * @return {String}        The index of the currently selected search result
 */
export function shouldOpenSelectedResult( state ) {
	return state.inlineHelpSearchResults.search.shouldOpenSelectedResult || false;
}

/**
 * Returns true if currently requesting search results for a given query; false
 * otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  searchQuery Search query
 * @return {Boolean}        Whether search results are being requested
 */
export function isRequestingInlineHelpSearchResultsForQuery( state, searchQuery ) {
	return !! state.inlineHelpSearchResults.requesting[ searchQuery ];
}

/**
 * Returns an array of all search results for a given search query or `null`
 * if there are no results for that query.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  searchQuery Search query
 * @return {?Array}         List of results for a given search query
 */
export function getInlineHelpSearchResultsForQuery( state, searchQuery ) {
	const searchResults = state.inlineHelpSearchResults.search.items[ searchQuery ];
	if ( ! searchResults ) {
		return null;
	}
	return searchResults;
}
