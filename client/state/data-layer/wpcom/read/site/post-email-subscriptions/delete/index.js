/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL } from 'calypso/state/reader/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { subscribeToNewPostEmail } from 'calypso/state/reader/follows/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

export function requestPostEmailUnsubscription( action ) {
	return http( {
		method: 'POST',
		path: `/read/site/${ action.payload.blogId }/post_email_subscriptions/delete`,
		apiVersion: '1.2',
		body: {}, // have to have the empty body for now to make the middleware happy
		onSuccess: action,
		onFailure: action,
	} );
}

export function receivePostEmailUnsubscription( action, response ) {
	// validate that it worked
	// if it did, just swallow this response, as we don't need to pass it along.
	const subscribed = !! ( response && response.subscribed );
	if ( subscribed ) {
		// shoot. something went wrong.
		return receivePostEmailUnsubscriptionError( action );
	}
}

export function receivePostEmailUnsubscriptionError( action ) {
	return [
		errorNotice( translate( 'Sorry, we had a problem unsubscribing. Please try again.' ) ),
		bypassDataLayer( subscribeToNewPostEmail( action.payload.blogId ) ),
	];
}

registerHandlers( 'state/data-layer/wpcom/read/site/post-email-subscriptions/delete/index.js', {
	[ READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL ]: [
		dispatchRequest( {
			fetch: requestPostEmailUnsubscription,
			onSuccess: receivePostEmailUnsubscription,
			onError: receivePostEmailUnsubscriptionError,
		} ),
	],
} );
