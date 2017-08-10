/** @format */
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

/**
 * Dispatches a request to fetch the current user notification settings
 *
 * @param   {Function} dispatch Redux dispatcher
 * @param   {Object}   action   Redux action
 * @returns {Object}            dispatched http action
 */
export const requestNotificationSettings = ( { dispatch }, action ) =>
	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'GET',
				path: '/me/notifications/settings',
			},
			action
		)
	);

/**
 * Dispatches a notification settings receive action then the request succeeded.
 *
 * @param   {Function} dispatch  Redux dispatcher
 * @param   {Object}   action    Redux action
 * @param   {Object}   settings  raw notification settings object returned by the endpoint
 * @returns {Object}             disparched user devices add action
 */
export const updateSettings = ( { dispatch }, action, settings ) =>
	dispatch(
		updateNotificationSettings( {
			settings,
		} )
	);

/**
 * Dispatches a error notice action when the request fails
 *
 * @param   {Function} dispatch Redux dispatcher
 * @returns {Object}            dispatched error notice action
 */
export const handleError = ( { dispatch } ) =>
	dispatch(
		errorNotice( translate( "We couldn't load your notification settings, please try again." ) )
	);

export default {
	[ NOTIFICATION_SETTINGS_REQUEST ]: [
		dispatchRequest( requestNotificationSettings, updateSettings, handleError ),
	],
};
