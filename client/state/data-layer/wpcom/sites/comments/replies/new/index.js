/** @format */

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

import { registerHandlers } from 'state/data-layer/handler-registry';

export const writeReplyComment = ( { dispatch }, action ) =>
	dispatchNewCommentRequest(
		dispatch,
		action,
		`/sites/${ action.siteId }/comments/${ action.parentCommentId }/replies/new`
	);

registerHandlers( 'state/data-layer/wpcom/sites/comments/replies/new/index.js', {
	[ COMMENTS_REPLY_WRITE ]: [
		dispatchRequest( writeReplyComment, updatePlaceholderComment, handleWriteCommentFailure ),
	],
} );

export default {};
