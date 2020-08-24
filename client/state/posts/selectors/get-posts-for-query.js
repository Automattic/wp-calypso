/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getQueryManager } from 'state/posts/selectors/get-query-manager';
import { getSerializedPostsQuery, normalizePostForDisplay } from 'state/posts/utils';

import 'state/posts/init';

/**
 * Returns an array of normalized posts for the posts query, or null if no
 * posts have been received.
 *
 * @param   {object}  state  Global state tree
 * @param   {?number} siteId Site ID, or `null` for all-sites queries
 * @param   {object}  query  Post query object
 * @returns {?Array}         Posts for the post query
 */
export const getPostsForQuery = createSelector(
	( state, siteId, query ) => {
		const manager = getQueryManager( state, siteId );
		if ( ! manager ) {
			return null;
		}

		const posts = manager.getItems( query );
		if ( ! posts ) {
			return null;
		}

		// PostQueryManager will return an array including undefined entries if
		// it knows that a page of results exists for the query (via a previous
		// request's `found` value) but the items haven't been received. While
		// we could impose this on the developer to accommodate, instead we
		// simply return null when any `undefined` entries exist in the set.
		//
		// TODO this is known to be incorrect behavior in some cases, because
		// the WP.com API skips unreadable posts entirely instead of including
		// them in the results.  See the 'handles items missing from the first
		// and last pages' test case for PaginatedQueryManager.
		if ( includes( posts, undefined ) ) {
			return null;
		}

		return posts.map( normalizePostForDisplay );
	},
	( state ) => [ state.posts.queries, state.posts.allSitesQueries ],
	( state, siteId, query ) => getSerializedPostsQuery( query, siteId )
);
