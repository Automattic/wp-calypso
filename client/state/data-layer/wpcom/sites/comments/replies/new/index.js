/** @format */

/**
 * Internal dependencies
 */

import { COMMENTS_REPLY_WRITE } from 'client/state/action-types';
import { dispatchRequest } from 'client/state/data-layer/wpcom-http/utils';
import {
	dispatchNewCommentRequest,
	updatePlaceholderComment,
	handleWriteCommentFailure,
} from 'client/state/data-layer/wpcom/sites/utils';

export const writeReplyComment = ( { dispatch }, action ) =>
	dispatchNewCommentRequest(
		dispatch,
		action,
		`/sites/${ action.siteId }/comments/${ action.parentCommentId }/replies/new`
	);

export default {
	[ COMMENTS_REPLY_WRITE ]: [
		dispatchRequest( writeReplyComment, updatePlaceholderComment, handleWriteCommentFailure ),
	],
};
