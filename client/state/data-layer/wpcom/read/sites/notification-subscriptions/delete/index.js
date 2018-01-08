/** @format */
/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_UNSUBSCRIBE_TO_NEW_POST_NOTIFICATIONS } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { errorNotice } from 'state/notices/actions';
import { translate } from 'i18n-calypso';
import { bypassDataLayer } from 'state/data-layer/utils';
import { subscribeToNewPostNotifications } from 'state/reader/follows/actions';

export function fromApi( response ) {
	const isAdded = !! ( response && response.success );
	if ( ! isAdded ) {
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
			path: `/read/sites/${ action.payload.blogId }/notification-subscriptions/delete`,
			method: 'POST',
			apiNamespace: 'wpcom/v2',
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

export default {
	[ READER_UNSUBSCRIBE_TO_NEW_POST_NOTIFICATIONS ]: [
		dispatchRequestEx( {
			fetch: requestNotificationUnsubscription,
			onSuccess: noop,
			onError: receiveNotificationUnsubscriptionError,
			fromApi,
		} ),
	],
};
