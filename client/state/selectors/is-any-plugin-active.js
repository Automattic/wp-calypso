/** @format */

/**
 * Internal dependencies
 */
import isPluginActive from 'state/selectors/is-plugin-active';

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
	const activePlugins = pluginSlugs.filter( pluginSlug =>
		isPluginActive( state, siteId, pluginSlug )
	);
	return !! activePlugins.length;
}
