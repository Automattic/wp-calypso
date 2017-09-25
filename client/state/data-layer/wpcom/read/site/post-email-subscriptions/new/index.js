/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { buildBody } from '../utils';
import { READER_SUBSCRIBE_TO_NEW_POST_EMAIL } from 'state/action-types';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { unsubscribeToNewPostEmail, updateNewPostEmailSubscription } from 'state/reader/follows/actions';

export function requestPostEmailSubscription( { dispatch }, action ) {
	dispatch(
		http( {
			method: 'POST',
			path: `/read/site/${ action.payload.blogId }/post_email_subscriptions/new`,
			body: buildBody( get( action, [ 'payload', 'deliveryFrequency' ] ) ),
			apiVersion: '1.2',
			onSuccess: action,
			onFailure: action,
		} )
	);
}

export function receivePostEmailSubscription( store, action, response ) {
	// validate that it worked
	const subscribed = !! ( response && response.subscribed );
	if ( ! subscribed ) {
		// shoot. something went wrong.
		receivePostEmailSubscriptionError( store, action );
		return;
	}
	// pass this on, but tack in the delivery_frequency that we got back from the API
	store.dispatch(
		bypassDataLayer(
			updateNewPostEmailSubscription(
				action.payload.blogId,
				get( response, [ 'subscription', 'delivery_frequency' ] )
			)
		)
	);
}

export function receivePostEmailSubscriptionError( { dispatch }, action ) {
	dispatch( errorNotice( translate( 'Sorry, we had a problem subscribing. Please try again.' ) ) );
	dispatch( bypassDataLayer( unsubscribeToNewPostEmail( action.payload.blogId ) ) );
}

export default {
	[ READER_SUBSCRIBE_TO_NEW_POST_EMAIL ]: [
		dispatchRequest(
			requestPostEmailSubscription,
			receivePostEmailSubscription,
			receivePostEmailSubscriptionError
		),
	],
};
