import 'calypso/state/inline-help/init';

/**
 * Returns the index of the currently selected search result.
 *
 * @param  {object}  state  Global state tree
 * @returns {number}        The index of the currently selected search result, integer
 */
export default function getSelectedResult( state ) {
	return state.inlineHelp.searchResults.search.selectedResult;
}
