/** @format */
/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_SUBSCRIBE_TO_NEW_POST_NOTIFICATIONS } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';
import { bypassDataLayer } from 'state/data-layer/utils';
import { unsubscribeToNewPostNotifications } from 'state/reader/follows/actions';

export function fromApi( response ) {
	const isSubscribed = !! ( response && response.subscribed );
	if ( ! isSubscribed ) {
		throw new Error(
			`Subscription to new post notifications failed with response: ${ JSON.stringify( response ) }`
		);
	}

	return response;
}

export function requestNotificationSubscription( action ) {
	return http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: `/read/sites/${ action.payload.blogId }/notification-subscriptions/new`,
			body: {}, // have to have an empty body to make wpcom-http happy
		},
		action
	);
}

export function receiveNotificationSubscriptionError( action ) {
	return [
		errorNotice(
			translate( 'Sorry, we had a problem subscribing you to notifications. Please try again.' )
		),
		bypassDataLayer( unsubscribeToNewPostNotifications( action.payload.blogId ) ),
	];
}

export default {
	[ READER_SUBSCRIBE_TO_NEW_POST_NOTIFICATIONS ]: [
		dispatchRequestEx( {
			fetch: requestNotificationSubscription,
			onSuccess: noop,
			onError: receiveNotificationSubscriptionError,
			fromApi,
		} ),
	],
};
