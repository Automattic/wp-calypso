/**
 * Internal dependencies
 */
import { SIDEBAR_TOGGLE_VISIBILITY } from 'state/action-types';

/**
 * Expand the sidebar.
 *
 * @returns {object} Action object
 */
export const expandSidebar = () => ( {
	type: SIDEBAR_TOGGLE_VISIBILITY,
	sidebarIsCollapsed: false,
} );

/**
 * Collapse the sidebar.
 *
 * @returns {object} Action object
 */
export const collapseSidebar = () => ( {
	type: SIDEBAR_TOGGLE_VISIBILITY,
	sidebarIsCollapsed: true,
} );
