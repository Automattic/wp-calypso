/** @format */
/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { unsubscribeToNewCommentEmail } from 'state/reader/follows/actions';
import { errorNotice } from 'state/notices/actions';
import { bypassDataLayer } from 'state/data-layer/utils';

import { registerHandlers } from 'state/data-layer/handler-registry';

export function requestCommentEmailSubscription( action ) {
	return http(
		{
			method: 'POST',
			path: `/read/site/${ action.payload.blogId }/comment_email_subscriptions/new`,
			body: {}, // have to have an empty body to make wpcom-http happy
			apiVersion: '1.2',
		},
		action
	);
}

export function receiveCommentEmailSubscription( action, response ) {
	// validate that it worked
	const subscribed = !! ( response && response.subscribed );
	if ( ! subscribed ) {
		return receiveCommentEmailSubscriptionError( action );
	}
}

export function receiveCommentEmailSubscriptionError( action ) {
	return [
		errorNotice( translate( 'Sorry, we had a problem subscribing. Please try again.' ) ),
		bypassDataLayer( unsubscribeToNewCommentEmail( action.payload.blogId ) ),
	];
}

registerHandlers( 'state/data-layer/wpcom/read/site/comment-email-subscriptions/new/index.js', {
	[ READER_SUBSCRIBE_TO_NEW_COMMENT_EMAIL ]: [
		dispatchRequest( {
			fetch: requestCommentEmailSubscription,
			onSuccess: receiveCommentEmailSubscription,
			onError: receiveCommentEmailSubscriptionError,
		} ),
	],
} );
