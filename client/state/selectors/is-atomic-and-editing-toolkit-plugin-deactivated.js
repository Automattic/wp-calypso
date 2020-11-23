/**
 * Internal dependencies
 */
import isPluginActive from 'calypso/state/selectors/is-plugin-active';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';

/**
 * Returns true if the site is Atomic AND the editing toolkit plugin is activated
 *
 * @param {object} state Global state tree
 * @param {object} siteId Site ID
 * @returns {boolean} True if the editing toolkit plugin is activated
 */
export default function isAtomicAndEditingToolkitPluginDeactivated( state, siteId ) {
	return isAtomicSite( state, siteId ) && ! isPluginActive( state, siteId, 'full-site-editing' );
}
