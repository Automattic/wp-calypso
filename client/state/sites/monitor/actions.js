/**
 * Internal dependencies
 */

import {
	SITE_MONITOR_SETTINGS_RECEIVE,
	SITE_MONITOR_SETTINGS_REQUEST,
	SITE_MONITOR_SETTINGS_REQUEST_FAILURE,
	SITE_MONITOR_SETTINGS_REQUEST_SUCCESS,
	SITE_MONITOR_SETTINGS_UPDATE,
	SITE_MONITOR_SETTINGS_UPDATE_FAILURE,
	SITE_MONITOR_SETTINGS_UPDATE_SUCCESS,
} from 'state/action-types';
import wp from 'lib/wp';

/**
 * Request the Jetpack monitor settings for a certain site.
 *
 * @param  {Int}       siteId  ID of the site.
 * @returns {Function}          Action thunk to request the Jetpack monitor settings when called.
 */
export const requestSiteMonitorSettings = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_MONITOR_SETTINGS_REQUEST,
			siteId,
		} );

		return wp
			.undocumented()
			.fetchMonitorSettings( siteId )
			.then( ( response ) => {
				dispatch( {
					type: SITE_MONITOR_SETTINGS_RECEIVE,
					siteId,
					settings: response.settings,
				} );

				dispatch( {
					type: SITE_MONITOR_SETTINGS_REQUEST_SUCCESS,
					siteId,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: SITE_MONITOR_SETTINGS_REQUEST_FAILURE,
					siteId,
					error,
				} );
			} );
	};
};

/**
 * Update the Jetpack monitor settings for a certain site.
 *
 * @param  {Int}       siteId    ID of the site.
 * @param  {object}    settings  Monitor settings.
 * @returns {Function}            Action thunk to update the Jetpack monitor settings when called.
 */
export const updateSiteMonitorSettings = ( siteId, settings ) => {
	return ( dispatch ) => {
		const { email_notifications, wp_note_notifications } = settings;

		dispatch( {
			type: SITE_MONITOR_SETTINGS_UPDATE,
			siteId,
			settings,
		} );

		return wp
			.undocumented()
			.updateMonitorSettings( siteId, email_notifications, wp_note_notifications )
			.then( () => {
				dispatch( {
					type: SITE_MONITOR_SETTINGS_UPDATE_SUCCESS,
					siteId,
					settings,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: SITE_MONITOR_SETTINGS_UPDATE_FAILURE,
					siteId,
					settings,
					error,
				} );
			} );
	};
};
