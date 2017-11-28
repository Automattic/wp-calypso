/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

function getPluginsState( state ) {
	return state.extensions.wpSuperCache.plugins;
}

/**
 * Returns true if we are requesting WPSC plugins for the specified site ID, false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean} Whether plugins are being requested
 */
export function isRequestingPlugins( state, siteId ) {
	return get( getPluginsState( state ), [ 'requesting', siteId ], false );
}

/**
 * Returns true if we are toggling WPSC plugin activation status for the specified site ID, false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {String}  plugin WPSC Plugin ID
 * @return {Boolean} Whether plugin is being enabled/disabled
 */
export function isTogglingPlugin( state, siteId, plugin ) {
	return get( getPluginsState( state ), [ 'toggling', siteId, plugin ], false );
}

/**
 * Returns the list of WPSC plugins for the specified site ID.
 *
 * @param  {Object} state Global state tree
 * @param  {Number} siteId Site ID
 * @return {Object} Plugins
 */
export function getPlugins( state, siteId ) {
	return get( getPluginsState( state ), [ 'items', siteId ], null );
}
