/** @format */

/**
 * Internal dependencies
 */
import isPluginActive from 'state/selectors/is-plugin-active';

// List of known plugins that replaces the default WP Admin editor.
const deniedPluginsList = [ 'elementor' ];

/**
 * Indicates whether a site has active a plugin that replaces the default WP Admin editor with other custom editor.
 *
 * @param {Object} state - Global state tree
 * @param {Number} siteId - Site ID
 * @return {Boolean} - truthiness of a site having at least one conflicting plugin active
 */
export default function hasWpAdminEditorConflictingPlugin( state, siteId ) {
	const activePlugins = deniedPluginsList.filter( pluginSlug =>
		isPluginActive( state, siteId, pluginSlug )
	);
	return !! activePlugins.length;
}
