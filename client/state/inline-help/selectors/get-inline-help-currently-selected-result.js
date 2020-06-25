/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getSearchQuery from 'state/inline-help/selectors/get-search-query';
import getInlineHelpSearchResultsForQuery from 'state/inline-help/selectors/get-inline-help-search-results-for-query';
import getSelectedResultIndex from 'state/inline-help/selectors/get-selected-result-index';
import getContextualHelpResults from 'state/inline-help/selectors/get-contextual-help-results';

import 'state/inline-help/init';

/**
 * Returns the selected search result item
 *
 * @param  {object}  state  Global state tree
 * @returns {object}        The selected search result
 */
export default function getInlineHelpCurrentlySelectedResult( state ) {
	const query = getSearchQuery( state );
	const results = getInlineHelpSearchResultsForQuery( state, query );
	const selectedIndex = getSelectedResultIndex( state );

	return get( results, selectedIndex ) || getContextualHelpResults( state )[ selectedIndex ];
}
