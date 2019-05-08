/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns a Boolean indicating if a site has an active plugin present
 * from a given array. This is useful for jetpack connected sites.
 *
 * @param {Object} state - Global state tree
 * @param {Number} siteId - Site ID
 * @param {Array} pluginSlugs - Array of plugin slugs for which to check
 * @return {Boolean} - truthiness of a site having at least one of the given plugins active
 */
export default function isAnyPluginActive( state, siteId, pluginSlugs ) {
	const sitePlugins = get( state, `plugins.installed.plugins[ ${ siteId } ]`, [] );
	const matches = sitePlugins.filter(
		plugin => pluginSlugs.includes( plugin.slug ) && plugin.active
	);
	return matches.length > 0;
}
