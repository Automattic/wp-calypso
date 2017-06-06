/**
 * Internal dependencies
 */
import {
	NOTIFICATION_SETTINGS_RECEIVE,
	NOTIFICATION_SETTINGS_REQUEST,
} from 'state/action-types';

/**
 * Returns an action object to signal the request of the current user notification settings.
 * @returns {Object} action object
 */
export const requestNotificationSettings = () => ( { type: NOTIFICATION_SETTINGS_REQUEST } );

/**
 * Returns an action object to signal the arrival of the requested notification settings.
 *
 * @param  {Object} settings User Notification Settings
 * @return {Object}          action object
 */
export const receiveNotificationSettings = ( { settings } ) => ( {
	type: NOTIFICATION_SETTINGS_RECEIVE,
	settings
} );
