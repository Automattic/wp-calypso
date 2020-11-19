/**
 * Internal dependencies
 */
import isPluginActive from 'calypso/state/selectors/is-plugin-active';

/**
 * Returns true if the editing toolkit plugin is activated
 *
 * @param {object} state Global state tree
 * @param {object} siteId Site ID
 * @returns {boolean} True if the editing toolkit plugin is activated
 */
export default function isEditingToolkitPluginActive( state, siteId ) {
	return isPluginActive( state, siteId, 'full-site-editing' );
}
