/**
 * External dependencies
 */
import { size } from 'lodash';

/**
 * Internal dependencies
 */
import { fetchStatusInitialState } from 'calypso/state/comments/reducer';
import { getPostCommentItems } from 'calypso/state/comments/selectors/get-post-comment-items';
import { getStateKey } from 'calypso/state/comments/utils';

import 'calypso/state/comments/init';

export function commentsFetchingStatus( state, siteId, postId, commentTotal = 0 ) {
	const fetchStatus =
		state.comments.fetchStatus[ getStateKey( siteId, postId ) ] ?? fetchStatusInitialState;
	const hasMoreComments = commentTotal > size( getPostCommentItems( state, siteId, postId ) );

	return {
		haveEarlierCommentsToFetch: fetchStatus.before && hasMoreComments,
		haveLaterCommentsToFetch: fetchStatus.after && hasMoreComments,
		hasReceivedBefore: fetchStatus.hasReceivedBefore,
		hasReceivedAfter: fetchStatus.hasReceivedAfter,
	};
}
