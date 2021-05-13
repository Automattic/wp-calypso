/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getInlineHelpSearchResultsForQuery from 'calypso/state/inline-help/selectors/get-inline-help-search-results-for-query';
import getSelectedResultIndex from 'calypso/state/inline-help/selectors/get-selected-result-index';
import getContextualHelpResults from 'calypso/state/inline-help/selectors/get-contextual-help-results';

import 'calypso/state/inline-help/init';

/**
 * Returns the selected search result item
 *
 * @param  {object}  state  Global state tree
 * @returns {object}        The selected search result
 */
export default function getInlineHelpCurrentlySelectedResult( state ) {
	const results = getInlineHelpSearchResultsForQuery( state );
	const selectedIndex = getSelectedResultIndex( state );

	return get( results, selectedIndex ) || getContextualHelpResults( state )[ selectedIndex ];
}
