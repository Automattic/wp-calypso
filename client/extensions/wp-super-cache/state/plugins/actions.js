/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';

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
import { errorNotice, removeNotice, successNotice } from 'state/notices/actions';

/**
 * Returns an action object to be used in signalling that WPSC plugins have been received.
 *
 * @param  {number} siteId Site ID
 * @param  {object} plugins Plugins object
 * @returns {object} Action object
 */
export const receivePlugins = ( siteId, plugins ) => ( {
	type: WP_SUPER_CACHE_RECEIVE_PLUGINS,
	siteId,
	plugins,
} );

/*
 * Retrieves WPSC plugins for a site.
 *
 * @param  {number} siteId Site ID
 * @returns {Function} Action thunk that requests plugins for a given site
 */
export const requestPlugins = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: WP_SUPER_CACHE_REQUEST_PLUGINS,
			siteId,
		} );

		return wp.req
			.get(
				{ path: `/jetpack-blogs/${ siteId }/rest-api/` },
				{ path: '/wp-super-cache/v1/plugins' }
			)
			.then( ( { data } ) => {
				dispatch( receivePlugins( siteId, data ) );
				dispatch( {
					type: WP_SUPER_CACHE_REQUEST_PLUGINS_SUCCESS,
					siteId,
				} );
			} )
			.catch( ( error ) => {
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
 * @param  {number}    siteId Site ID
 * @param  {string}    plugin Plugin to enable or disable
 * @param  {boolean}   activationStatus True to enable, false to disable
 * @returns {Function} Action thunk that toggles the plugin on a given site
 */
export const togglePlugin = ( siteId, plugin, activationStatus ) => {
	return ( dispatch ) => {
		dispatch( { type: WP_SUPER_CACHE_TOGGLE_PLUGIN, siteId, plugin } );
		dispatch( removeNotice( 'wpsc-toggle-plugin' ) );

		return wp.req
			.post(
				{ path: `/jetpack-blogs/${ siteId }/rest-api/` },
				{
					path: '/wp-super-cache/v1/plugins',
					body: JSON.stringify( { [ plugin ]: activationStatus } ),
					json: true,
				}
			)
			.then( ( { data } ) => {
				const notice = activationStatus
					? translate( 'Plugin successfully enabled' )
					: translate( 'Plugin successfully disabled' );
				dispatch( receivePlugins( siteId, data ) );
				dispatch( { type: WP_SUPER_CACHE_TOGGLE_PLUGIN_SUCCESS, siteId, plugin } );
				dispatch( successNotice( notice, { id: 'wpsc-toggle-plugin' } ) );
			} )
			.catch( ( error ) => {
				dispatch( { type: WP_SUPER_CACHE_TOGGLE_PLUGIN_FAILURE, siteId, plugin, error } );
				dispatch(
					errorNotice(
						translate( 'There was a problem toggling plugin activation. Please try again.' ),
						{ id: 'wpsc-toggle-plugin' }
					)
				);
			} );
	};
};
