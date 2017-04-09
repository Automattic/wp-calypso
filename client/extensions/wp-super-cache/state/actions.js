/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import {
	WP_SUPER_CACHE_RECEIVE_SETTINGS,
	WP_SUPER_CACHE_REQUEST_SETTINGS,
	WP_SUPER_CACHE_REQUEST_SETTINGS_FAILURE,
	WP_SUPER_CACHE_REQUEST_SETTINGS_SUCCESS,
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
