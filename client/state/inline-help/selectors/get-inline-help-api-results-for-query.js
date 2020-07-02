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
 * Returns an array of all API results for the current search query or an
 * empty array if there are no results for that query.
 * These items are collected from the endpoint response.
 *
 * @param  {object} state  Global state tree.
 * @returns {Array} List of API endpoint results for a given search query.
 */

export default function getInlineHelpAPIResultsForQuery( state ) {
	return filter(
		getInlineHelpSearchResultsForQuery( state ),
		item => typeof item.support_type === 'undefined'
	);
}
