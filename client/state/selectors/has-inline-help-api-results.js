/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Indicates whether the current search results came from the API or are
 * statically coded "contextual" results.
 * see: client/blocks/inline-help/contextual-help.js
 *
 * @param  {object}  state  Global state tree
 * @returns {boolean} Whether the search results came from the API or are static "contextual" results
 */
export default function hasInlineHelpAPIResults( state ) {
	return get( state, 'inlineHelp.searchResults.search.hasAPIResults' );
}
