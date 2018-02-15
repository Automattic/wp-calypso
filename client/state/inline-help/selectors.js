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
	return !! state.inlineHelpSearchResults.search.requesting[ searchQuery ];
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

/**
 * Returns whether we should open the currently selected context link.
 *
 * @param  {Object}  state  Global state tree
 * @return {String}        The index of the currently selected context link
 */
export function shouldOpenSelectedContextLink( state ) {
	return state.inlineHelpSearchResults.contextLinks.shouldOpenSelectedContextLink || false;
}

/**
 * Returns the index of the currently selected context link.
 *
 * @param  {Object}  state  Global state tree
 * @return {String}        The index of the currently selected context link
 */
export function getSelectedContextLink( state ) {
	return state.inlineHelpSearchResults.contextLinks.selectedResult;
}

/**
 * Returns an array of all context links for a given context or the default
 * set of context links if there are none specific to that context.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  context Context object
 * @return {?Array}         List of context links for a given context
 */
export function getInlineHelpContextLinksForContext( state ) {
	return state.inlineHelpSearchResults.contextLinks.items[ state.inlineHelpSearchResults.contextLinks.context.url ];
}

/**
 * Returns true if currently requesting search results for a given query; false
 * otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  context Context object
 * @return {Boolean}        Whether context links are being requested
 */
export function isRequestingInlineHelpContextLinksForContext( state, context ) {
	return !! state.inlineHelpSearchResults.contextLinks.requesting[ context ];
}
