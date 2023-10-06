import { createSelector } from '@automattic/state-utils';
import { fetchStatusInitialState } from 'calypso/state/comments/reducer';
import { getPostCommentItems } from 'calypso/state/comments/selectors/get-post-comment-items';
import { getStateKey } from 'calypso/state/comments/utils';

import 'calypso/state/comments/init';

export const commentsFetchingStatus = createSelector(
	( state, siteId, postId, commentTotal = 0 ) => {
		const fetchStatus =
			state.comments.fetchStatus[ getStateKey( siteId, postId ) ] ?? fetchStatusInitialState;
		const hasMoreComments =
			commentTotal > ( getPostCommentItems( state, siteId, postId )?.length ?? 0 );

		return {
			haveEarlierCommentsToFetch: fetchStatus.before && hasMoreComments,
			haveLaterCommentsToFetch: fetchStatus.after && hasMoreComments,
			hasReceivedBefore: fetchStatus.hasReceivedBefore,
			hasReceivedAfter: fetchStatus.hasReceivedAfter,
		};
	},
	( state, siteId, postId, commentTotal = 0 ) => {
		const fetchStatus =
			state.comments.fetchStatus[ getStateKey( siteId, postId ) ] ?? fetchStatusInitialState;
		const hasMoreComments =
			commentTotal > ( getPostCommentItems( state, siteId, postId )?.length ?? 0 );
		return [ fetchStatus, hasMoreComments ];
	}
);
