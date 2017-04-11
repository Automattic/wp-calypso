/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import {
	READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL,
	READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL,
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { subscribeToNewCommentEmail, unsubscribeToNewCommentEmail } from 'state/reader/follows/actions';
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
		// shoot. something went wrong.
		receiveCommentEmailSubscriptionError( store, action, next );
		return;
	}
}

export function receiveCommentEmailSubscriptionError( { dispatch }, action, next ) {
	dispatch( errorNotice( translate( 'Sorry, we had a problem subscribing. Please try again.' ) ) );
	// dispatch an unsubscribe
	next( unsubscribeToNewCommentEmail( action.payload.blogId ) );
}

export function requestCommentEmailUnsubscription( { dispatch }, action, next ) {
	dispatch( http( {
		method: 'POST',
		path: `/read/site/${ action.payload.blogId }/comment_email_subscriptions/delete`,
		apiVersion: '1.2',
		body: {}, // have to have the empty body for now to make the middleware happy
		onSuccess: action,
		onFailure: action,
	} ) );
	next( action );
}

export function receiveCommentEmailUnsubscription( store, action, next, response ) {
	// validate that it worked
	// if it did, just swallow this response, as we don't need to pass it along.
	const subscribed = !! ( response && response.subscribed );
	if ( subscribed ) {
		// shoot. something went wrong.
		receiveCommentEmailUnsubscriptionError( store, action, next );
		return;
	}
}

export function receiveCommentEmailUnsubscriptionError( { dispatch }, action, next ) {
	dispatch( errorNotice( translate( 'Sorry, we had a problem unsubscribing. Please try again.' ) ) );
	next( subscribeToNewCommentEmail( action.payload.blogId ) );
}

export default {
	[ READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL ]: [
		dispatchRequest(
			requestCommentEmailSubscription,
			receiveCommentEmailSubscription,
			receiveCommentEmailSubscriptionError
		)
	],
	[ READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL ]: [
		dispatchRequest(
			requestCommentEmailUnsubscription,
			receiveCommentEmailUnsubscription,
			receiveCommentEmailUnsubscriptionError
		)
	],
};
