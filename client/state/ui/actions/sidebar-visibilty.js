/**
 * Internal dependencies
 */
import { SIDEBAR_TOGGLE_VISIBILITY } from 'calypso/state/action-types';

import 'calypso/state/ui/init';

/**
 * Expand the sidebar.
 *
 * @returns {object} Action object
 */
export const expandSidebar = () => ( {
	type: SIDEBAR_TOGGLE_VISIBILITY,
	collapsed: false,
} );

/**
 * Collapse the sidebar.
 *
 * @returns {object} Action object
 */
export const collapseSidebar = () => ( {
	type: SIDEBAR_TOGGLE_VISIBILITY,
	collapsed: true,
} );
