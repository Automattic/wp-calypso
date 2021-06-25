/**
 */

/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { READER_CONVERSATION_MUTE } from 'calypso/state/reader/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice, plainNotice } from 'calypso/state/notices/actions';
import { updateConversationFollowStatus } from 'calypso/state/reader/conversations/actions';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

export function requestConversationMute( action ) {
	return http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: `/read/sites/${ action.payload.siteId }/posts/${ action.payload.postId }/mute`,
			body: {}, // have to have an empty body to make wpcom-http happy
		},
		action
	);
}

export function receiveConversationMute( action, response ) {
	// validate that it worked
	const isMuting = !! ( response && response.success );
	if ( ! isMuting ) {
		return receiveConversationMuteError( action );
	}

	return plainNotice( translate( 'The conversation has been successfully unfollowed.' ), {
		duration: 5000,
	} );
}

export function receiveConversationMuteError( {
	payload: { siteId, postId },
	meta: { previousState },
} ) {
	return [
		errorNotice(
			translate( 'Sorry, we had a problem unfollowing that conversation. Please try again.' )
		),
		updateConversationFollowStatus( {
			siteId,
			postId,
			followStatus: previousState,
		} ),
	];
}

registerHandlers( 'state/data-layer/wpcom/read/sites/posts/mute/index.js', {
	[ READER_CONVERSATION_MUTE ]: [
		dispatchRequest( {
			fetch: requestConversationMute,
			onSuccess: receiveConversationMute,
			onError: receiveConversationMuteError,
		} ),
	],
} );
