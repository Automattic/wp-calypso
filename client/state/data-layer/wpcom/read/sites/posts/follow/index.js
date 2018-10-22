/**
 * @format
 */

/**
 * External Dependencies
 */
import { merge } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { READER_CONVERSATION_FOLLOW } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'state/notices/actions';
import { updateConversationFollowStatus } from 'state/reader/conversations/actions';
import { bypassDataLayer } from 'state/data-layer/utils';
import getReaderConversationFollowStatus from 'state/selectors/get-reader-conversation-follow-status';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const requestConversationFollow = action => ( dispatch, getState ) => {
	const actionWithRevert = merge( {}, action, {
		meta: {
			previousState: getReaderConversationFollowStatus( getState(), {
				siteId: action.payload.siteId,
				postId: action.payload.postId,
			} ),
		},
	} );
	dispatch(
		http(
			{
				method: 'POST',
				apiNamespace: 'wpcom/v2',
				path: `/read/sites/${ action.payload.siteId }/posts/${ action.payload.postId }/follow`,
				body: {}, // have to have an empty body to make wpcom-http happy
			},
			actionWithRevert
		)
	);
};

export const receiveConversationFollow = ( action, response ) => {
	// validate that it worked
	const isFollowing = !! ( response && response.success );
	if ( ! isFollowing ) {
		return receiveConversationFollowError( action );
	}

	return successNotice( translate( 'The conversation has been successfully followed.' ), {
		duration: 5000,
	} );
};

export function receiveConversationFollowError( {
	payload: { siteId, postId },
	meta: { previousState },
} ) {
	return [
		errorNotice(
			translate( 'Sorry, we had a problem following that conversation. Please try again.' )
		),
		bypassDataLayer(
			updateConversationFollowStatus( {
				siteId,
				postId,
				followStatus: previousState,
			} )
		),
	];
}

registerHandlers( 'state/data-layer/wpcom/read/sites/posts/follow/index.js', {
	[ READER_CONVERSATION_FOLLOW ]: [
		dispatchRequestEx( {
			fetch: requestConversationFollow,
			onSuccess: receiveConversationFollow,
			onError: receiveConversationFollowError,
		} ),
	],
} );
