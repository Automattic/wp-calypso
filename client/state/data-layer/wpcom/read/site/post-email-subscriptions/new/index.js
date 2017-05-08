/**
 * External Dependencies
 */
import { get } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import {
	READER_SUBSCRIBE_TO_NEW_POST_EMAIL
} from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { unsubscribeToNewPostEmail, updateNewPostEmailSubscription } from 'state/reader/follows/actions';
import { errorNotice } from 'state/notices/actions';
import { buildBody } from '../utils';

export function requestPostEmailSubscription( { dispatch }, action, next ) {
	dispatch( http( {
		method: 'POST',
		path: `/read/site/${ action.payload.blogId }/post_email_subscriptions/new`,
		body: buildBody( get( action, [ 'payload', 'deliveryFrequency' ] ) ),
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
	next( unsubscribeToNewPostEmail( action.payload.blogId ) );
}

export default {
	[ READER_SUBSCRIBE_TO_NEW_POST_EMAIL ]: [
		dispatchRequest(
			requestPostEmailSubscription,
			receivePostEmailSubscription,
			receivePostEmailSubscriptionError
		)
	]
};
