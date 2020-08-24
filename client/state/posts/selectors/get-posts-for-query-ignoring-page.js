/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getQueryManager } from 'state/posts/selectors/get-query-manager';
import { getSerializedPostsQueryWithoutPage, normalizePostForDisplay } from 'state/posts/utils';

import 'state/posts/init';

/**
 * Returns an array of normalized posts for the posts query, including all
 * known queried pages, or null if the posts for the query are not known.
 *
 * @param   {object}  state  Global state tree
 * @param   {?number} siteId Site ID, or `null` for all-sites queries
 * @param   {object}  query  Post query object
 * @returns {?Array}         Posts for the post query
 */
export const getPostsForQueryIgnoringPage = createSelector(
	( state, siteId, query ) => {
		const manager = getQueryManager( state, siteId );
		if ( ! manager ) {
			return null;
		}

		const itemsIgnoringPage = manager.getItemsIgnoringPage( query );
		if ( ! itemsIgnoringPage ) {
			return null;
		}

		return itemsIgnoringPage.map( normalizePostForDisplay );
	},
	( state ) => [ state.posts.queries, state.posts.allSitesQueries ],
	( state, siteId, query ) => getSerializedPostsQueryWithoutPage( query, siteId )
);
