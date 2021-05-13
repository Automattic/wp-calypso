/**
 * External dependencies
 */
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/plugins/init';

/**
 * Returns a Boolean indicating if a site has a particular plugin that
 * is active. This is useful for jetpack connected sites.
 *
 * @param {object} state - Global state tree
 * @param {number} siteId - Site ID
 * @param {string} pluginSlug - Plugin slug
 * @returns {boolean} - truthiness of a site having an active plugin
 */
export default function isPluginActive( state, siteId, pluginSlug ) {
	const sitePlugins = state.plugins.installed.plugins[ siteId ];
	const plugin = find( sitePlugins, { slug: pluginSlug, active: true } );
	if ( ! plugin ) {
		return false;
	}
	return plugin.active;
}
