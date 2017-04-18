/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import {
	READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { unsubscribeToNewCommentEmail } from 'state/reader/follows/actions';
import { errorNotice } from 'state/notices/actions';

export function requestCommentEmailSubscription( { dispatch }, action, next ) {
	dispatch( http( {
		method: 'POST',
		path: `/read/site/${ action.payload.blogId }/comment_email_subscriptions/new`,
		body: {}, // have to have an empty body to make wpcom-http happy
		apiVersion: '1.2',
		onSuccess: action,
		onFailure: action,
	} ) );
	next( action );
}

export function receiveCommentEmailSubscription( store, action, next, response ) {
	// validate that it worked
	const subscribed = !! ( response && response.subscribed );
	if ( ! subscribed ) {
		receiveCommentEmailSubscriptionError( store, action, next );
		return;
	}
}

export function receiveCommentEmailSubscriptionError( { dispatch }, action, next ) {
	dispatch( errorNotice( translate( 'Sorry, we had a problem subscribing. Please try again.' ) ) );
	next( unsubscribeToNewCommentEmail( action.payload.blogId ) );
}

export default {
	[ READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL ]: [
		dispatchRequest(
			requestCommentEmailSubscription,
			receiveCommentEmailSubscription,
			receiveCommentEmailSubscriptionError
		)
	]
};
