/** @format */
/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL } from 'client/state/action-types';
import { http } from 'client/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'client/state/data-layer/wpcom-http/utils';
import { unsubscribeToNewCommentEmail } from 'client/state/reader/follows/actions';
import { errorNotice } from 'client/state/notices/actions';
import { bypassDataLayer } from 'client/state/data-layer/utils';

export function requestCommentEmailSubscription( { dispatch }, action ) {
	dispatch(
		http( {
			method: 'POST',
			path: `/read/site/${ action.payload.blogId }/comment_email_subscriptions/new`,
			body: {}, // have to have an empty body to make wpcom-http happy
			apiVersion: '1.2',
			onSuccess: action,
			onFailure: action,
		} )
	);
}

export function receiveCommentEmailSubscription( store, action, response ) {
	// validate that it worked
	const subscribed = !! ( response && response.subscribed );
	if ( ! subscribed ) {
		receiveCommentEmailSubscriptionError( store, action );
		return;
	}
}

export function receiveCommentEmailSubscriptionError( { dispatch }, action ) {
	dispatch( errorNotice( translate( 'Sorry, we had a problem subscribing. Please try again.' ) ) );
	dispatch( bypassDataLayer( unsubscribeToNewCommentEmail( action.payload.blogId ) ) );
}

export default {
	[ READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL ]: [
		dispatchRequest(
			requestCommentEmailSubscription,
			receiveCommentEmailSubscription,
			receiveCommentEmailSubscriptionError
		),
	],
};
