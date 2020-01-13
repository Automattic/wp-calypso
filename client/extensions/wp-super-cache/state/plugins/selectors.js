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
 * @param  {object}  state Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean} Whether plugins are being requested
 */
export function isRequestingPlugins( state, siteId ) {
	return get( getPluginsState( state ), [ 'requesting', siteId ], false );
}

/**
 * Returns true if we are toggling WPSC plugin activation status for the specified site ID, false otherwise.
 *
 * @param  {object}  state Global state tree
 * @param  {number}  siteId Site ID
 * @param  {string}  plugin WPSC Plugin ID
 * @returns {boolean} Whether plugin is being enabled/disabled
 */
export function isTogglingPlugin( state, siteId, plugin ) {
	return get( getPluginsState( state ), [ 'toggling', siteId, plugin ], false );
}

/**
 * Returns the list of WPSC plugins for the specified site ID.
 *
 * @param  {object} state Global state tree
 * @param  {number} siteId Site ID
 * @returns {object} Plugins
 */
export function getPlugins( state, siteId ) {
	return get( getPluginsState( state ), [ 'items', siteId ], null );
}
