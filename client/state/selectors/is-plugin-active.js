/** @format */
/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Returns a Boolean indicating if a site has a particular plugin that
 * is active. This is useful for jetpack connected sites.
 *
 * @param {Object} state - Global state tree
 * @param {Number} siteId - Site ID
 * @param {String} pluginSlug - Plugin slug
 * @return {Boolean} - truthiness of a site having an active plugin
 */
export default function isPluginActive( state, siteId, pluginSlug ) {
	const sitePlugins = state.plugins.installed.plugins[ siteId ];
	const plugin = find( sitePlugins, { slug: pluginSlug, active: true } );
	if ( ! plugin ) {
		return false;
	}
	return plugin.active;
}
