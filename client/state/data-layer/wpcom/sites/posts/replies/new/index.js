/**
 * Internal dependencies
 */
import { COMMENTS_WRITE } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	dispatchNewCommentRequest,
	updatePlaceholderComment,
	handleWriteCommentFailure,
} from 'state/data-layer/wpcom/sites/utils';

export const newPostReply = ( { dispatch }, action ) => {
	if ( action.parentCommentId ) {
		return;
	}

	const path = `/sites/${ action.siteId }/posts/${ action.postId }/replies/new`;
	dispatchNewCommentRequest( dispatch, action, path );
};

export default {
	[ COMMENTS_WRITE ]: [ dispatchRequest( newPostReply, updatePlaceholderComment, handleWriteCommentFailure ) ]
};
