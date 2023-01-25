import { translate } from 'i18n-calypso';
import { NOTIFICATION_SETTINGS_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { updateNotificationSettings } from 'calypso/state/notification-settings/actions';

/**
 * Returns an action for HTTP request to fetch the current user notification settings
 *
 * @param   {Object}   action   Redux action
 * @returns {Object}            http action
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
 * @param   {Object}   action    Redux action
 * @param   {Object}   settings  raw notification settings object returned by the endpoint
 * @returns {Object}             notification settings update action
 */
export const updateSettings = ( action, settings ) => updateNotificationSettings( settings );

/**
 * Returns an error notice action when the request fails
 *
 * @returns {Object}   error notice action
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
