/**
 * External Dependencies
 */
import { get } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { READER_SUBSCRIBE_TO_NEW_POST_EMAIL } from 'calypso/state/reader/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	unsubscribeToNewPostEmail,
	updateNewPostEmailSubscription,
} from 'calypso/state/reader/follows/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { buildBody } from '../utils';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

export function requestPostEmailSubscription( action ) {
	return http( {
		method: 'POST',
		path: `/read/site/${ action.payload.blogId }/post_email_subscriptions/new`,
		body: buildBody( get( action, [ 'payload', 'deliveryFrequency' ] ) ),
		apiVersion: '1.2',
		onSuccess: action,
		onFailure: action,
	} );
}

export function receivePostEmailSubscription( action, response ) {
	// validate that it worked
	const subscribed = !! ( response && response.subscribed );
	if ( ! subscribed ) {
		// shoot. something went wrong.
		return receivePostEmailSubscriptionError( action );
	}
	// pass this on, but tack in the delivery_frequency that we got back from the API
	return bypassDataLayer(
		updateNewPostEmailSubscription(
			action.payload.blogId,
			get( response, [ 'subscription', 'delivery_frequency' ] )
		)
	);
}

export function receivePostEmailSubscriptionError( action ) {
	return [
		errorNotice( translate( 'Sorry, we had a problem subscribing. Please try again.' ) ),
		bypassDataLayer( unsubscribeToNewPostEmail( action.payload.blogId ) ),
	];
}

registerHandlers( 'state/data-layer/wpcom/read/site/post-email-subscriptions/new/index.js', {
	[ READER_SUBSCRIBE_TO_NEW_POST_EMAIL ]: [
		dispatchRequest( {
			fetch: requestPostEmailSubscription,
			onSuccess: receivePostEmailSubscription,
			onError: receivePostEmailSubscriptionError,
		} ),
	],
} );
