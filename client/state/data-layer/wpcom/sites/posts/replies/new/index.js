/** @format */
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

export const writePostComment = ( { dispatch }, action ) =>
	dispatchNewCommentRequest(
		dispatch,
		action,
		`/sites/${ action.siteId }/posts/${ action.postId }/replies/new`
	);

export default {
	[ COMMENTS_WRITE ]: [
		dispatchRequest( writePostComment, updatePlaceholderComment, handleWriteCommentFailure ),
	],
};
