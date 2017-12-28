/** @format */
/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL } from 'client/state/action-types';
import { http } from 'client/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'client/state/data-layer/wpcom-http/utils';
import { subscribeToNewPostEmail } from 'client/state/reader/follows/actions';
import { errorNotice } from 'client/state/notices/actions';
import { bypassDataLayer } from 'client/state/data-layer/utils';

export function requestPostEmailUnsubscription( { dispatch }, action ) {
	dispatch(
		http( {
			method: 'POST',
			path: `/read/site/${ action.payload.blogId }/post_email_subscriptions/delete`,
			apiVersion: '1.2',
			body: {}, // have to have the empty body for now to make the middleware happy
			onSuccess: action,
			onFailure: action,
		} )
	);
}

export function receivePostEmailUnsubscription( store, action, response ) {
	// validate that it worked
	// if it did, just swallow this response, as we don't need to pass it along.
	const subscribed = !! ( response && response.subscribed );
	if ( subscribed ) {
		// shoot. something went wrong.
		receivePostEmailUnsubscriptionError( store, action );
		return;
	}
}

export function receivePostEmailUnsubscriptionError( { dispatch }, action ) {
	dispatch(
		errorNotice( translate( 'Sorry, we had a problem unsubscribing. Please try again.' ) )
	);
	dispatch( bypassDataLayer( subscribeToNewPostEmail( action.payload.blogId ) ) );
}

export default {
	[ READER_UNSUBSCRIBE_TO_NEW_POST_EMAIL ]: [
		dispatchRequest(
			requestPostEmailUnsubscription,
			receivePostEmailUnsubscription,
			receivePostEmailUnsubscriptionError
		),
	],
};
