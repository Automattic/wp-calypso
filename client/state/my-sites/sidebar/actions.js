/**
 * Internal dependencies
 */
import {
	MY_SITES_SIDEBAR_SECTION_TOGGLE,
	MY_SITES_SIDEBAR_SECTION_EXPAND,
	MY_SITES_SIDEBAR_SECTION_COLLAPSE,
	MY_SITES_SIDEBAR_SECTIONS_COLLAPSE_ALL,
} from 'calypso/state/action-types';

import 'calypso/state/my-sites/init';

const createSidebarAction = ( type ) => ( sidebarSection ) => ( {
	type,
	sidebarSection,
} );

export const toggleMySitesSidebarSection = createSidebarAction( MY_SITES_SIDEBAR_SECTION_TOGGLE );

export const expandMySitesSidebarSection = createSidebarAction( MY_SITES_SIDEBAR_SECTION_EXPAND );

export const collapseMySitesSidebarSection = createSidebarAction(
	MY_SITES_SIDEBAR_SECTION_COLLAPSE
);

export const collapseAllMySitesSidebarSections = () => {
	return {
		type: MY_SITES_SIDEBAR_SECTIONS_COLLAPSE_ALL,
	};
};
