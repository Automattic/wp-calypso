/**
 * Internal dependencies
 */
import { COMMENTS_WRITE } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	hasParentCommentId,
	dispatchNewCommentRequest,
	updatePlaceholderComment,
	handleWriteCommentFailure,
} from 'state/data-layer/wpcom/sites/utils';

export const newPostReply = ( { dispatch }, action ) => {
	if ( hasParentCommentId( action ) ) {
		return;
	}

	const path = `/sites/${ action.siteId }/posts/${ action.postId }/replies/new`;
	dispatchNewCommentRequest( dispatch, action, path );
};

const onSuccess = ( { dispatch }, action, ...args ) => hasParentCommentId( action )
	? updatePlaceholderComment( { dispatch }, action, ...args )
	: null;

const onFailure = ( { dispatch }, action, ...args ) => hasParentCommentId( action )
	? handleWriteCommentFailure( { dispatch }, action, ...args )
	: null;

export default {
	[ COMMENTS_WRITE ]: [ dispatchRequest( newPostReply, onSuccess, onFailure ) ]
};
