/** @format */
/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Returns the current search query.
 *
 * @param  {Object}  state  Global state tree
 * @return {String}        The current search query
 */
export function getSearchQuery( state ) {
	return get( state, 'inlineHelpSearchResults.search.searchQuery', '' );
}

/**
 * Returns the index of the currently selected search result.
 *
 * @param  {Object}  state  Global state tree
 * @return {Integer}        The index of the currently selected search result
 */
export function getSelectedResult( state ) {
	return get( state, 'inlineHelpSearchResults.search.selectedResult', -1 );
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
	return !! get( state, 'inlineHelpSearchResults.requesting.' + searchQuery );
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
	const searchResults = get( state, 'inlineHelpSearchResults.search.items.' + searchQuery );
	if ( ! searchResults ) {
		return null;
	}
	return searchResults;
}

/**
 * Returns the link / href of the selected search result item
 * @param  {Object}  state  Global state tree
 * @return {String}         The href of the selected link target
 */
export function getInlineHelpCurrentlySelectedLink( state ) {
	const query = getSearchQuery( state );
	const results = getInlineHelpSearchResultsForQuery( state, query );
	const result = get( results, getSelectedResult( state ), null );
	return get( result, 'link', '' );
}
