/**
 * Internal dependencies
 */
import { COMMENTS_REPLY_WRITE } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	dispatchNewCommentRequest,
	updatePlaceholderComment,
	handleWriteCommentFailure,
} from 'state/data-layer/wpcom/sites/utils';

export const writeReplyComment = ( { dispatch }, action ) => {
	const path = `/sites/${ action.siteId }/comments/${ action.parentCommentId }/replies/new`;
	dispatchNewCommentRequest( dispatch, action, path );
};

export default {
	[ COMMENTS_REPLY_WRITE ]: [ dispatchRequest( writeReplyComment, updatePlaceholderComment, handleWriteCommentFailure ) ]
};
