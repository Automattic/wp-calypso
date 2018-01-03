/** @format */
/**
 * Internal dependencies
 */
import { READER_SUBSCRIBE_TO_NEW_POST_NOTIFICATIONS } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';

function fromApi( response ) {
	const isAdded = !! ( response && response.success );
	if ( ! isAdded ) {
		throw new Error(
			`Subscription to new post notifications failed with response: ${ JSON.stringify( response ) }`
		);
	}

	return response;
}

export function requestNotificationSubscription( action ) {
	return http(
		{
			path: `/read/sites/${ action.payload.blogId }/notification-subscriptions/new`,
			method: 'POST',
			apiNamespace: 'wpcom/v2',
		},
		action
	);
}

export function receiveNotificationSubscriptionError() {
	return [
		errorNotice(
			translate( 'Sorry, we had a problem subscribing you to notifications. Please try again.' )
		),
		//bypassDataLayer( unsubscribeFromNewPostNotifications ( action.payload.blogId ) ) @todo add revert
	];
}

export default {
	[ READER_SUBSCRIBE_TO_NEW_POST_NOTIFICATIONS ]: [
		dispatchRequestEx( {
			fetch: requestNotificationSubscription,
			onError: receiveNotificationSubscriptionError,
			fromApi,
		} ),
	],
};
