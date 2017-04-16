/**
 * Internal dependencies
 */
import {
	SITE_MONITOR_SETTINGS_RECEIVE,
	SITE_MONITOR_SETTINGS_REQUEST,
	SITE_MONITOR_SETTINGS_REQUEST_FAILURE,
	SITE_MONITOR_SETTINGS_REQUEST_SUCCESS,
} from 'state/action-types';
import wp from 'lib/wp';

/**
 * Request the Jetpack monitor settings for a certain site.
 *
 * @param  {Int}       siteId  ID of the site.
 * @return {Function}          Action thunk to request the Jetpack monitor settings when called.
 */
export const requestSiteMonitorSettings = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_MONITOR_SETTINGS_REQUEST,
			siteId
		} );

		return wp.undocumented().fetchMonitorSettings( siteId )
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
			} ).catch( ( error ) => {
				dispatch( {
					type: SITE_MONITOR_SETTINGS_REQUEST_FAILURE,
					siteId,
					error,
				} );
			} );
	};
};
