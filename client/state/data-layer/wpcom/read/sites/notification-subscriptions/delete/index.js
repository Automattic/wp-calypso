/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_UNSUBSCRIBE_TO_NEW_POST_NOTIFICATIONS } from 'calypso/state/reader/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { translate } from 'i18n-calypso';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { subscribeToNewPostNotifications } from 'calypso/state/reader/follows/actions';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';

export function fromApi( response ) {
	const isUnsubscribed = !! ( response && response.subscribed === false );
	if ( ! isUnsubscribed ) {
		throw new Error(
			`Unsubscription from new post notifications failed with response: ${ JSON.stringify(
				response
			) }`
		);
	}

	return response;
}

export function requestNotificationUnsubscription( action ) {
	return http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: `/read/sites/${ action.payload.blogId }/notification-subscriptions/delete`,
			body: {}, // have to have an empty body to make wpcom-http happy
		},
		action
	);
}

export function receiveNotificationUnsubscriptionError( action ) {
	return [
		errorNotice(
			translate( 'Sorry, we had a problem unsubscribing you from notifications. Please try again.' )
		),
		bypassDataLayer( subscribeToNewPostNotifications( action.payload.blogId ) ),
	];
}

registerHandlers( 'state/data-layer/wpcom/read/sites/notification-subscriptions/delete/index.js', {
	[ READER_UNSUBSCRIBE_TO_NEW_POST_NOTIFICATIONS ]: [
		dispatchRequest( {
			fetch: requestNotificationUnsubscription,
			onSuccess: noop,
			onError: receiveNotificationUnsubscriptionError,
			fromApi,
		} ),
	],
} );
