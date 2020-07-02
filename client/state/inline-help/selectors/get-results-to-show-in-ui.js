
/**
 * Internal dependencies
 */
import 'state/inline-help/init';
import hasInlineHelpAPIResults from 'state/selectors/has-inline-help-api-results';
import getInlineHelpAdminResultsForQuery from 'state/inline-help/selectors/get-inline-help-admin-results-for-query';
import getInlineHelpContextualResultsForQuery from 'state/inline-help/selectors/get-inline-help-contextual-results-for-query';
import getInlineHelpAPIResultsForQuery from "state/inline-help/selectors/get-inline-help-api-results-for-query";

/**
 * Returns an array of result to show in the user interface.
 *
 * @param  {object} state  Global state tree.
 * @returns {Array} List of results to show in the UI.
 */

export default function getResultsToShow( state ) {
	const items = [];

	if ( ! hasInlineHelpAPIResults( state ) ) {
		// if there is not API endpoint results, shows the
		// contextual-help results.
		items.push( ...getInlineHelpContextualResultsForQuery( state ) );
	} else {
		// ... show the API response results.
		items.push( ...getInlineHelpAPIResultsForQuery( state ) );
	}

	// ... and always, add admin section results.
	items.push( ...getInlineHelpAdminResultsForQuery( state ) );

	return items;
}
