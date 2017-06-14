/**
 * Internal dependencies
 */
import {
	COMMENTS_REMOVE,
	COMMENTS_RECEIVE,
	COMMENTS_COUNT_INCREMENT,
	COMMENTS_WRITE,
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	createPlaceholderComment,
	handleSuccess,
	handleWriteCommentFailure,
} from 'state/data-layer/wpcom/sites/utils';

export const writePostComment = ( { dispatch }, action ) => {
	if ( ! action.parentCommentId ) {
		return;
	}

	const { siteId, postId, parentCommentId, commentText } = action;
	const placeholder = createPlaceholderComment( commentText, postId, parentCommentId );

	// Insert a placeholder
	dispatch( {
		type: COMMENTS_RECEIVE,
		siteId,
		postId,
		comments: [ placeholder ],
		skipSort: true
	} );

	dispatch( http( {
		method: 'POST',
		apiVersion: '1.1',
		path: `/sites/${ siteId }/comments/${ parentCommentId }/replies/new`,
		body: {
			content: commentText
		},
		onSuccess: {
			...action,
			placeholderId: placeholder.ID
		},
		onFailure: action
	} ) );
};

export default {
	[ COMMENTS_WRITE ]: [ dispatchRequest( writePostComment, handleSuccess, handleWriteCommentFailure ) ]
};
