/**
 * @format
 */

/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { READER_CONVERSATION_FOLLOW } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice, successNotice } from 'state/notices/actions';
import { unfollowConversation } from 'state/reader/conversations/actions';
import { bypassDataLayer } from 'state/data-layer/utils';

export function requestConversationFollow( { dispatch }, action ) {
	dispatch(
		http( {
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: `/read/sites/${ action.payload.blogId }/posts/${ action.payload.postId }/follow`,
			body: {}, // have to have an empty body to make wpcom-http happy
			onSuccess: action,
			onFailure: action,
		} )
	);
}

export function receiveConversationFollow( store, action, response ) {
	// validate that it worked
	const isFollowing = !! ( response && response.success );
	if ( ! isFollowing ) {
		receiveConversationFollowError( store, action );
		return;
	}

	store.dispatch(
		successNotice( translate( 'The conversation has been successfully followed.' ), {
			duration: 5000,
		} )
	);
}

export function receiveConversationFollowError( { dispatch }, action ) {
	dispatch(
		errorNotice(
			translate( 'Sorry, we had a problem following that conversation. Please try again.' )
		)
	);

	dispatch(
		bypassDataLayer( unfollowConversation( action.payload.blogId, action.payload.postId ) )
	);
}

export default {
	[ READER_CONVERSATION_FOLLOW ]: [
		dispatchRequest(
			requestConversationFollow,
			receiveConversationFollow,
			receiveConversationFollowError
		),
	],
};
