/**
 * External Dependencies
 */
import { get, includes, merge } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import {
	READER_SUBSCRIBE_TO_NEW_POST_EMAIL,
	READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL,
	READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION,
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { subscribeToNewPostEmail, unsubscribeToNewPostEmail, updateNewPostEmailSubscription } from 'state/reader/follows/actions';
import { errorNotice } from 'state/notices/actions';
import { getReaderFollowForBlog } from 'state/selectors';

function validateParameters( params ) {
	// the only valid param is delivery_frequency
	const frequency = params.deliveryFrequency;
	const validFrequencies = [
		'instantly',
		'daily',
		'weekly',
	];
	if ( includes( validFrequencies, frequency ) ) {
		return {
			delivery_frequency: frequency
		};
	}
	return {};
}

export function requestPostEmailSubscription( { dispatch }, action, next ) {
	dispatch( http( {
		method: 'POST',
		path: `/read/site/${ action.payload.blogId }/post_email_subscriptions/new`,
		body: validateParameters( action.payload ), // have to have an empty body to make wpcom-http happy
		apiVersion: '1.2',
		onSuccess: action,
		onFailure: action,
	} ) );
	next( action );
}

export function receivePostEmailSubscription( store, action, next, response ) {
	// validate that it worked
	const subscribed = !! ( response && response.subscribed );
	if ( ! subscribed ) {
		// shoot. something went wrong.
		receivePostEmailSubscriptionError( store, action, next );
		return;
	}
	// pass this on, but tack in the delivery_frequency that we got back from the API
	next(
		updateNewPostEmailSubscription(
			action.payload.blogId,
			get( response, [ 'subscription', 'delivery_frequency' ] )
		)
	);
}

export function receivePostEmailSubscriptionError( { dispatch }, action, next ) {
	dispatch( errorNotice( translate( 'Sorry, we had a problem subscribing. Please try again.' ) ) );
	// dispatch an unsubscribe
	next( unsubscribeToNewPostEmail( action.payload.blogId ) );
}

export function requestUpdatePostEmailSubscription( { dispatch, getState }, action, next ) {
	const actionWithRevert = merge( {}, action, {
		meta: {
			previousState: get(
				getReaderFollowForBlog( getState(), action.payload.blogId ),
				[ 'delivery_frequency', 'email', 'post_delivery_frequency' ]
			)
		}
	} );
	dispatch( http( {
		method: 'POST',
		path: `/read/site/${ action.payload.blogId }/post_email_subscriptions/update`,
		apiVersion: '1.2',
		body: validateParameters( action.payload ),
		onSuccess: actionWithRevert,
		onFailure: actionWithRevert,
	} ) );
	next( action );
}

export function receiveUpdatePostEmailSubscription( store, action, next, response ) {
	if ( ! ( response && response.success ) ) {
		// revert
		receiveUpdatePostEmailSubscriptionError( store, action, next );
	}
}

export function receiveUpdatePostEmailSubscriptionError( { dispatch }, { payload: { blogId }, meta: { previousState } }, next ) {
	dispatch( errorNotice( translate( 'Sorry, we had a problem updating that subscription. Please try again.' ) ) );
	next(
		updateNewPostEmailSubscription( blogId, previousState )
	);
}

export function requestPostEmailUnsubscription( { dispatch }, action, next ) {
	dispatch( http( {
		method: 'POST',
		path: `/read/site/${ action.payload.blogId }/post_email_subscriptions/delete`,
		apiVersion: '1.2',
		body: {}, // have to have the empty body for now to make the middleware happy
		onSuccess: action,
		onFailure: action,
	} ) );
	next( action );
}

export function receivePostEmailUnsubscription( store, action, next, response ) {
	// validate that it worked
	// if it did, just swallow this response, as we don't need to pass it along.
	const subscribed = !! ( response && response.subscribed );
	if ( subscribed ) {
		// shoot. something went wrong.
		receivePostEmailUnsubscriptionError( store, action, next );
		return;
	}
}

export function receivePostEmailUnsubscriptionError( { dispatch }, action, next ) {
	dispatch( errorNotice( translate( 'Sorry, we had a problem unsubscribing. Please try again.' ) ) );
	next( subscribeToNewPostEmail( action.payload.blogId ) );
}

export default {
	[ READER_SUBSCRIBE_TO_NEW_POST_EMAIL ]: [
		dispatchRequest(
			requestPostEmailSubscription,
			receivePostEmailSubscription,
			receivePostEmailSubscriptionError
		)
	],
	[ READER_UPDATE_NEW_POST_EMAIL_SUBSCRIPTION ]: [
		dispatchRequest(
			requestUpdatePostEmailSubscription,
			receiveUpdatePostEmailSubscription,
			receiveUpdatePostEmailSubscriptionError
		)
	],
	[ READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL ]: [
		dispatchRequest(
			requestPostEmailUnsubscription,
			receivePostEmailUnsubscription,
			receivePostEmailUnsubscriptionError
		)
	],
};
