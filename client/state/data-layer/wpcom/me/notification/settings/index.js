/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { NOTIFICATION_SETTINGS_REQUEST } from 'state/action-types';
import { updateNotificationSettings } from 'state/notification-settings/actions';
import { errorNotice } from 'state/notices/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

/**
 * Returns an action for HTTP request to fetch the current user notification settings
 *
 * @param   {object}   action   Redux action
 * @returns {object}            http action
 */
export const requestNotificationSettings = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: '/me/notifications/settings',
		},
		action
	);

/**
 * Returns a notification settings receive action then the request succeeded.
 *
 * @param   {object}   action    Redux action
 * @param   {object}   settings  raw notification settings object returned by the endpoint
 * @returns {object}             notification settings update action
 */
export const updateSettings = ( action, settings ) => updateNotificationSettings( settings );

/**
 * Returns an error notice action when the request fails
 *
 * @returns {object}   error notice action
 */
export const handleError = () =>
	errorNotice( translate( "We couldn't load your notification settings, please try again." ) );

registerHandlers( 'state/data-layer/wpcom/me/notification/settings/index.js', {
	[ NOTIFICATION_SETTINGS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestNotificationSettings,
			onSuccess: updateSettings,
			onError: handleError,
		} ),
	],
} );
