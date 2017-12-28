/** @format */
/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL } from 'client/state/action-types';
import { http } from 'client/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'client/state/data-layer/wpcom-http/utils';
import { subscribeToNewCommentEmail } from 'client/state/reader/follows/actions';
import { errorNotice } from 'client/state/notices/actions';
import { bypassDataLayer } from 'client/state/data-layer/utils';

export function requestCommentEmailUnsubscription( { dispatch }, action ) {
	dispatch(
		http( {
			method: 'POST',
			path: `/read/site/${ action.payload.blogId }/comment_email_subscriptions/delete`,
			apiVersion: '1.2',
			body: {}, // have to have the empty body for now to make the middleware happy
			onSuccess: action,
			onFailure: action,
		} )
	);
}

export function receiveCommentEmailUnsubscription( store, action, response ) {
	// validate that it worked
	// if it did, just swallow this response, as we don't need to pass it along.
	const subscribed = !! ( response && response.subscribed );
	if ( subscribed ) {
		// shoot. something went wrong.
		receiveCommentEmailUnsubscriptionError( store, action );
		return;
	}
}

export function receiveCommentEmailUnsubscriptionError( { dispatch }, action ) {
	dispatch(
		errorNotice( translate( 'Sorry, we had a problem unsubscribing. Please try again.' ) )
	);
	dispatch( bypassDataLayer( subscribeToNewCommentEmail( action.payload.blogId ) ) );
}

export default {
	[ READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL ]: [
		dispatchRequest(
			requestCommentEmailUnsubscription,
			receiveCommentEmailUnsubscription,
			receiveCommentEmailUnsubscriptionError
		),
	],
};
