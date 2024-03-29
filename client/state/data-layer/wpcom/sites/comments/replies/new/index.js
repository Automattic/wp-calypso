import { COMMENTS_REPLY_WRITE } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import {
	dispatchNewCommentRequest,
	updatePlaceholderComment,
	handleWriteCommentFailure,
} from 'calypso/state/data-layer/wpcom/sites/utils';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

export const writeReplyComment = ( action ) =>
	dispatchNewCommentRequest(
		action,
		`/sites/${ action.siteId }/comments/${ action.parentCommentId }/replies/new`
	);

registerHandlers( 'state/data-layer/wpcom/sites/comments/replies/new/index.js', {
	[ COMMENTS_REPLY_WRITE ]: [
		dispatchRequest( {
			fetch: writeReplyComment,
			onSuccess: updatePlaceholderComment,
			onError: handleWriteCommentFailure,
		} ),
	],
} );

export default {};
