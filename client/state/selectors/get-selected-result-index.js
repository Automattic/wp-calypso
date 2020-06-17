/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Returns the index of the currently selected search result.
 *
 * @param  {object}  state  Global state tree
 * @returns {number}        The index of the currently selected search result, integer
 */
export default function getSelectedResultIndex( state ) {
	return get( state, 'inlineHelp.searchResults.search.selectedResult', -1 );
}
