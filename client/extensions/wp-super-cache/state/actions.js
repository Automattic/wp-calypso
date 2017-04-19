/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import {
	WP_SUPER_CACHE_RECEIVE_SETTINGS,
	WP_SUPER_CACHE_REQUEST_SETTINGS,
	WP_SUPER_CACHE_REQUEST_SETTINGS_FAILURE,
	WP_SUPER_CACHE_REQUEST_SETTINGS_SUCCESS,
	WP_SUPER_CACHE_SAVE_SETTINGS,
	WP_SUPER_CACHE_SAVE_SETTINGS_FAILURE,
	WP_SUPER_CACHE_SAVE_SETTINGS_SUCCESS,
	WP_SUPER_CACHE_UPDATE_SETTINGS,
} from './action-types';

/**
 * Returns an action object to be used in signalling that settings have been received.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} data Settings object
 * @return {Object} Action object
 */
export const receiveSettings = ( siteId, data ) => ( { type: WP_SUPER_CACHE_RECEIVE_SETTINGS, siteId, data } );

/*
 * Retrieves settings for a site.
 *
 * @param  {Number} siteId Site ID
 * @returns {Function} Action thunk that requests settings for a given site
 */
export const requestSettings = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: WP_SUPER_CACHE_REQUEST_SETTINGS,
			siteId,
		} );

		return wp.req.get( { path: `/jetpack-blogs/${ siteId }/rest-api/` }, { path: '/wp-super-cache/v1/settings' } )
			.then( ( { data } ) => {
				dispatch( receiveSettings( siteId, data ) );
				dispatch( {
					type: WP_SUPER_CACHE_REQUEST_SETTINGS_SUCCESS,
					siteId,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: WP_SUPER_CACHE_REQUEST_SETTINGS_FAILURE,
					siteId,
					error,
				} );
			} );
	};
};

/**
 * Returns an action object to be used in signalling that some wpsc settings have been updated
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} settings The updated site settings
 * @return {Object}        Action object
 */
export const updateSettings = ( siteId, settings ) => {
	return {
		type: WP_SUPER_CACHE_UPDATE_SETTINGS,
		siteId,
		settings
	};
};

/**
 * @param  {Number} siteId Site ID
 * @param  {Object} updatedSettings the updated settings
 * @returns {Function} Action thunk that updates the settings for a given site
 */
export const saveSettings = ( siteId, updatedSettings ) => {
	return ( dispatch ) => {
		dispatch( {
			type: WP_SUPER_CACHE_SAVE_SETTINGS,
			siteId,
		} );

		return wp.req.post( { path: `/jetpack-blogs/${ siteId }/rest-api/` }, { path: '/wp-super-cache/v1/settings', ...updatedSettings } )
			.then( ( { updated } ) => {
				dispatch( updateSettings( siteId, updated ) );
				dispatch( {
					type: WP_SUPER_CACHE_SAVE_SETTINGS_SUCCESS,
					siteId,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: WP_SUPER_CACHE_SAVE_SETTINGS_FAILURE,
					siteId,
					error,
				} );
			} );
	};
};
