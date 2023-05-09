import { translate } from 'i18n-calypso';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL } from 'calypso/state/reader/action-types';
import { subscribeToNewCommentEmail } from 'calypso/state/reader/follows/actions';

export function requestCommentEmailUnsubscription( action ) {
	return http(
		{
			method: 'POST',
			path: `/read/site/${ action.payload.blogId }/comment_email_subscriptions/delete`,
			apiVersion: '1.2',
			body: {}, // have to have the empty body for now to make the middleware happy
		},
		action
	);
}

export function receiveCommentEmailUnsubscription( action, response ) {
	// validate that it worked
	// if it did, just swallow this response, as we don't need to pass it along.
	const subscribed = !! ( response && response.subscribed );
	if ( subscribed ) {
		// shoot. something went wrong.
		return receiveCommentEmailUnsubscriptionError( action );
	}
}

export function receiveCommentEmailUnsubscriptionError( action ) {
	return [
		errorNotice( translate( 'Sorry, we had a problem unsubscribing. Please try again.' ) ),
		bypassDataLayer( subscribeToNewCommentEmail( action.payload.blogId ) ),
	];
}

registerHandlers( 'state/data-layer/wpcom/read/site/comment-email-subscriptions/delete/index.js', {
	[ READER_UNSUBSCRIBE_TO_NEW_COMMENT_EMAIL ]: [
		dispatchRequest( {
			fetch: requestCommentEmailUnsubscription,
			onSuccess: receiveCommentEmailUnsubscription,
			onError: receiveCommentEmailUnsubscriptionError,
		} ),
	],
} );
