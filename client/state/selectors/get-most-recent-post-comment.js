/** @format */

/**
 * External dependencies
 */

import { orderBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getStateKey, getCommentDate } from 'state/comments/utils';

/**
 * Select the most recent comment for a specific post.
 */
const getMostRecentPostComment = createSelector(
	( state, siteId, postId ) => {
		const postComments = state.comments.items[ getStateKey( siteId, postId ) ];

		if ( ! postComments ) {
			return null;
		}

		// There's a skipSort option in the reducer, so make sure they're in date order
		const orderedPostComments = orderBy( postComments, getCommentDate, [ 'desc' ] );

		return orderedPostComments[ 0 ];
	},
	state => [ state.comments.items ]
);

export default getMostRecentPostComment;
