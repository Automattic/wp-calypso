/**
 * Internal dependencies
 */
import 'calypso/state/inline-help/init';
import getSearchQuery from 'calypso/state/inline-help/selectors/get-search-query';

/**
 * Returns an array of admin help search results for the current search query or an
 * empty array if there are no results for that query.
 *
 * @param  {object}  state  Global state tree.
 * @returns {Array} List of admin help results for a given search query.
 */

export default function getInlineHelpAdminSectionSearchResultsForQuery( state ) {
	const searchQuery = getSearchQuery( state );
	const { inlineHelp: { searchResults: { search: { items } = {} } = {} } = {} } = state;
	const allResults = ( items[ searchQuery ] ?? [] ).filter(
		( r ) => r.support_type === 'admin_section'
	);
	return allResults;
}
