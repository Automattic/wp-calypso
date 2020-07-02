/**
 * External Dependencies
 */
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/inline-help/init';
import getInlineHelpSearchResultsForQuery from 'state/inline-help/selectors/get-inline-help-search-results-for-query';

/**
 * Returns an array of all admin-help  results for the current search query or an
 * empty array if there are no results for that query.
 *
 * @param  {object}  state  Global state tree.
 * @returns {Array} List of admin-help results for a given search query.
 */

export default function getInlineHelpAdminResultsForQuery( state ) {
	return filter(
		getInlineHelpSearchResultsForQuery( state ),
		{ support_type: 'admin_section' }
	);
}
