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
 * @param  {Object} settings Settings object
 * @return {Object} Action object
 */
export const receiveSettings = ( siteId, settings ) => ( { type: WP_SUPER_CACHE_RECEIVE_SETTINGS, siteId, settings } );

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
 * Returns an action object to be used in signalling that settings have been updated.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} settings Updated settings
 * @return {Object} Action object
 */
export const updateSettings = ( siteId, settings ) => ( { type: WP_SUPER_CACHE_UPDATE_SETTINGS, siteId, settings } );

/**
 * Saves settings for a site.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} settings Updated settings
 * @returns {Function} Action thunk that updates the settings for a given site
 */
export const saveSettings = ( siteId, settings ) => {
	return ( dispatch ) => {
		dispatch( {
			type: WP_SUPER_CACHE_SAVE_SETTINGS,
			siteId,
		} );

		return wp.req.post( { path: `/jetpack-blogs/${ siteId }/rest-api/` }, {}, { path: '/wp-super-cache/v1/settings', ...settings } )
			.then( () => {
				dispatch( updateSettings( siteId, settings ) );
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
