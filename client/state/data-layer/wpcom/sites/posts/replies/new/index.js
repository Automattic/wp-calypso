/**
 * Internal dependencies
 */

import { COMMENTS_WRITE } from 'calypso/state/action-types';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	dispatchNewCommentRequest,
	updatePlaceholderComment,
	handleWriteCommentFailure,
} from 'calypso/state/data-layer/wpcom/sites/utils';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

export const writePostComment = ( action ) =>
	dispatchNewCommentRequest(
		action,
		`/sites/${ action.siteId }/posts/${ action.postId }/replies/new`
	);

registerHandlers( 'state/data-layer/wpcom/sites/posts/replies/new/index.js', {
	[ COMMENTS_WRITE ]: [
		dispatchRequest( {
			fetch: writePostComment,
			onSuccess: updatePlaceholderComment,
			onError: handleWriteCommentFailure,
		} ),
	],
} );

export default {};
