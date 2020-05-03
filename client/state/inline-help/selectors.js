/**
 * External Dependencies
 */
import { get, flow } from 'lodash';

/**
 * Internal Dependencies
 */
import { getLastRouteAction } from 'state/ui/action-log/selectors';
import pathToSection from 'lib/path-to-section';
// @TODO: getContextResults should perhaps be moved to /state or /lib
import { getContextResults } from 'blocks/inline-help/contextual-help';

/**
 * Returns the current search query.
 *
 * @param  {object}  state  Global state tree
 * @returns {string}        The current search query
 */
export function getSearchQuery( state ) {
	return get( state, 'inlineHelp.searchResults.search.searchQuery', '' );
}

/**
 * Returns the index of the currently selected search result.
 *
 * @param  {object}  state  Global state tree
 * @returns {number}       The index of the currently selected search result, integer
 */
export function getSelectedResultIndex( state ) {
	return get( state, 'inlineHelp.searchResults.search.selectedResult', -1 );
}

/**
 * Returns true if currently requesting search results for a given query; false
 * otherwise.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  searchQuery Search query
 * @returns {boolean}        Whether search results are being requested
 */
export function isRequestingInlineHelpSearchResultsForQuery( state, searchQuery ) {
	const allRequesting = get( state, 'inlineHelp.searchResults.requesting' );
	return !! get( allRequesting, [ searchQuery ] );
}

/**
 * Returns an array of all search results for a given search query or `null`
 * if there are no results for that query.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  searchQuery Search query
 * @returns {?Array}         List of results for a given search query
 */
export function getInlineHelpSearchResultsForQuery( state, searchQuery ) {
	const allResults = get( state, 'inlineHelp.searchResults.search.items' );
	return get( allResults, [ searchQuery ], null );
}

/**
 * Returns an array of contextual results
 *
 * @param  {object}  state  Global state tree
 * @returns {Array}          List of contextual results based on route
 */
export const getContextualHelpResults = flow(
	getLastRouteAction,
	( x ) => x.path,
	pathToSection,
	getContextResults,
	( x = [] ) => x
);

/**
 * Returns the selected search result item
 *
 * @param  {object}  state  Global state tree
 * @returns {object}         The selected search result
 */
export function getInlineHelpCurrentlySelectedResult( state ) {
	const query = getSearchQuery( state );
	const results = getInlineHelpSearchResultsForQuery( state, query );
	const selectedIndex = getSelectedResultIndex( state );

	return get( results, selectedIndex ) || getContextualHelpResults( state )[ selectedIndex ];
}

/**
 * Returns the link / href of the selected search result item
 *
 * @param  {object}  state  Global state tree
 * @returns {string}         The href of the selected link target
 */
export function getInlineHelpCurrentlySelectedLink( state ) {
	const result = getInlineHelpCurrentlySelectedResult( state );
	return get( result, 'link', '' );
}

/**
 * Returns a bool indicating if the contact form UI is showing the Q&A suggestions.
 *
 * @param  {object}  state  Global state tree
 * @returns {boolean}        Is the contact form UI showing the questions
 */
export function isShowingQandAInlineHelpContactForm( state ) {
	return get( state, 'inlineHelp.contactForm.isShowingQandASuggestions', false );
}

/**
 * Returns a bool indicating if the inline help popover is currently showing.
 *
 * @param  {object}  state  Global state tree
 * @returns {boolean}        Is the inline help popover is showing.
 */
export function isInlineHelpPopoverVisible( state ) {
	return get( state, 'inlineHelp.popover.isVisible', false );
}
