/** @format */
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
 * @param  {Object}  state  Global state tree
 * @return {String}        The current search query
 */
export function getSearchQuery( state ) {
	return get( state, 'inlineHelp.searchResults.search.searchQuery', '' );
}

/**
 * Returns the index of the currently selected search result.
 *
 * @param  {Object}  state  Global state tree
 * @return {Integer}        The index of the currently selected search result
 */
export function getSelectedResultIndex( state ) {
	return get( state, 'inlineHelp.searchResults.search.selectedResult', -1 );
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
	const allRequesting = get( state, 'inlineHelp.searchResults.requesting' );
	return !! get( allRequesting, [ searchQuery ] );
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
	const allResults = get( state, 'inlineHelp.searchResults.search.items' );
	return get( allResults, [ searchQuery ], null );
}

/**
 * Returns an array of contextual results
 * @param  {Object}  state  Global state tree
 * @return {Array}          List of contextual results based on route
 */
export const getContextualHelpResults = flow(
	getLastRouteAction,
	x => x.path,
	pathToSection,
	getContextResults,
	( x = [] ) => x
);

/**
 * Returns the selected search result item
 * @param  {Object}  state  Global state tree
 * @return {Object}         The selected search result
 */
export function getInlineHelpCurrentlySelectedResult( state ) {
	const query = getSearchQuery( state );
	const results = getInlineHelpSearchResultsForQuery( state, query );
	const selectedIndex = getSelectedResultIndex( state );

	return get( results, selectedIndex ) || getContextualHelpResults( state )[ selectedIndex ];
}

/**
 * Returns the link / href of the selected search result item
 * @param  {Object}  state  Global state tree
 * @return {String}         The href of the selected link target
 */
export function getInlineHelpCurrentlySelectedLink( state ) {
	const result = getInlineHelpCurrentlySelectedResult( state );
	return get( result, 'link', '' );
}

/**
 * Returns a bool indicating if the contact form UI is showing the Q&A suggestions.
 *
 * @param  {Object}  state  Global state tree
 * @return {Boolean}        Is the contact form UI showing the questions
 */
export function isShowingQandAInlineHelpContactForm( state ) {
	return get( state, 'inlineHelp.contactForm.isShowingQandASuggestions', false );
}

/**
 * Returns a bool indicating if the inline help popover is currently showing.
 *
 * @param  {Object}  state  Global state tree
 * @return {Boolean}        Is the inline help popover is showing.
 */
export function isInlineHelpPopoverVisible( state ) {
	return get( state, 'inlineHelp.popover.isVisible', false );
}

/**
 * Returns a bool indicating if the inline help popover is currently showing the checklist prompt.
 *
 * @param  {Object}  state  Global state tree
 * @return {Boolean}        Is the inline help popover showing the checklist prompt.
 */
export function isInlineHelpChecklistPromptVisible( state ) {
	return get( state, 'inlineHelp.checklistPrompt.isVisible', false );
}

/**
 * Returns a bool indicating if the inline help popover is currently showing the onboarding welcome message.
 *
 * @param  {Object}  state  Global state tree
 * @return {Boolean}        Is the inline help popover showing the onboarding welcome prompt.
 */
export function isOnboardingWelcomePromptVisible( state ) {
	return get( state, 'inlineHelp.onboardingWelcomePrompt.isVisible', false );
}

/**
 * Returns the task ID that should show up in the inline help popover.
 *
 * @param  {Object}  state  Global state tree
 * @return {String}         The task ID
 */
export function getChecklistPromptTaskId( state ) {
	return get( state, 'inlineHelp.checklistPrompt.taskId', null );
}

export function getChecklistPromptStep( state ) {
	return get( state, 'inlineHelp.checklistPrompt.step', 0 );
}
