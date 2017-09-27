/**
 * Internal dependencies
 */
import wp from 'lib/wp';
import {
	WP_SUPER_CACHE_RECEIVE_PLUGINS,
	WP_SUPER_CACHE_REQUEST_PLUGINS,
	WP_SUPER_CACHE_REQUEST_PLUGINS_FAILURE,
	WP_SUPER_CACHE_REQUEST_PLUGINS_SUCCESS,
	WP_SUPER_CACHE_TOGGLE_PLUGIN,
	WP_SUPER_CACHE_TOGGLE_PLUGIN_FAILURE,
	WP_SUPER_CACHE_TOGGLE_PLUGIN_SUCCESS,
} from '../action-types';
import { normalizePlugins } from './utils';
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';
import { getSiteTitle } from 'state/sites/selectors';

/**
 * Returns an action object to be used in signalling that plugins have been received.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} plugins Plugins object
 * @return {Object} Action object
 */
export const receivePlugins = ( siteId, plugins ) => ( { type: WP_SUPER_CACHE_RECEIVE_PLUGINS, siteId, plugins } );

/*
 * Retrieves plugins for a site.
 *
 * @param  {Number} siteId Site ID
 * @returns {Function} Action thunk that requests plugins for a given site
 */
export const requestPlugins = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: WP_SUPER_CACHE_REQUEST_PLUGINS,
			siteId,
		} );

		return wp.req.get( { path: `/jetpack-blogs/${ siteId }/rest-api/` }, { path: '/wp-super-cache/v1/plugins' } )
			.then( ( { data } ) => {
				dispatch( receivePlugins( siteId, normalizePlugins( data ) || {} ) );
				dispatch( {
					type: WP_SUPER_CACHE_REQUEST_PLUGINS_SUCCESS,
					siteId,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: WP_SUPER_CACHE_REQUEST_PLUGINS_FAILURE,
					siteId,
					error,
				} );
			} );
	};
};

/**
 * Toggle WPSC plugin activation status on a given site.
 *
 * @param  {Number}    siteId Site ID
 * @param  {String}    plugin Plugin to enable or disable
 * @param  {Boolean}   activationStatus True to enable, false to disable
 * @returns {Function} Action thunk that toggles the plugin on a given site
 */
export const togglePlugin = ( siteId, plugin, activationStatus ) => {
	return ( dispatch ) => {
		dispatch( { type: WP_SUPER_CACHE_TOGGLE_PLUGIN, siteId } );

		return wp.req.post(
			{ path: `/jetpack-blogs/${ siteId }/rest-api/` },
			{ path: '/wp-super-cache/v1/plugins', body: JSON.stringify( { [ plugin ]: activationStatus } ), json: true } )
			.then( ( { data } ) => {
				//dispatch( receivePlugins( siteId, normalizePlugins( data ) || {} ) );
				dispatch( { type: WP_SUPER_CACHE_TOGGLE_PLUGIN_SUCCESS, siteId } );
			} )
			.catch( error => {
				dispatch( { type: WP_SUPER_CACHE_TOGGLE_PLUGIN_FAILURE, siteId, error } );
			} );
	};
};
