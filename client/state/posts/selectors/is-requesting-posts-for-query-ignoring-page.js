/**
 * External dependencies
 */
import { isEqual, omit, some } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import {
	getDeserializedPostsQueryDetails,
	getNormalizedPostsQuery,
	getSerializedPostsQuery,
} from 'state/posts/utils';

import 'state/posts/init';

/**
 * Returns true if currently requesting posts for the posts query, regardless
 * of page, or false otherwise.
 *
 * @param   {object}  state  Global state tree
 * @param   {?number} siteId Site ID, or `null` for all-sites queries
 * @param   {object}  query  Post query object
 * @returns {boolean}        Whether posts are being requested
 */
export const isRequestingPostsForQueryIgnoringPage = createSelector(
	( state, siteId, query ) => {
		const normalizedQueryWithoutPage = omit( getNormalizedPostsQuery( query ), 'page' );
		return some( state.posts.queryRequests, ( isRequesting, serializedQuery ) => {
			if ( ! isRequesting ) {
				return false;
			}

			const queryDetails = getDeserializedPostsQueryDetails( serializedQuery );
			// Specific site query
			if ( queryDetails.siteId && queryDetails.siteId !== siteId ) {
				return false;
			}
			// All-sites query
			if ( ! queryDetails.siteId && siteId ) {
				return false;
			}

			return isEqual( normalizedQueryWithoutPage, omit( queryDetails.query, 'page' ) );
		} );
	},
	( state ) => state.posts.queryRequests,
	( state, siteId, query ) => getSerializedPostsQuery( query, siteId )
);
