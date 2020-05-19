/**
 * Internal dependencies
 */

import {
	MY_SITES_SIDEBAR_SECTION_TOGGLE,
	MY_SITES_SIDEBAR_SECTION_EXPAND,
	MY_SITES_SIDEBAR_SECTION_COLLAPSE,
} from 'state/action-types';

const createSidebarAction = ( type ) => ( sidebarSection ) => ( {
	type,
	sidebarSection,
} );

export const toggleMySitesSidebarSection = createSidebarAction( MY_SITES_SIDEBAR_SECTION_TOGGLE );

export const expandMySitesSidebarSection = createSidebarAction( MY_SITES_SIDEBAR_SECTION_EXPAND );

export const collapseMySitesSidebarSection = createSidebarAction(
	MY_SITES_SIDEBAR_SECTION_COLLAPSE
);
