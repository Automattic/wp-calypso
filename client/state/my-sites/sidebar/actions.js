/** @format */

/**
 * Internal dependencies
 */

import {
	MY_SITES_SIDEBAR_SITE_TOGGLE,
	MY_SITES_SIDEBAR_DESIGN_TOGGLE,
	MY_SITES_SIDEBAR_TOOLS_TOGGLE,
	MY_SITES_SIDEBAR_MANAGE_TOGGLE,
} from 'state/action-types';

export function toggleMySitesSidebarSiteMenu() {
	return {
		type: MY_SITES_SIDEBAR_SITE_TOGGLE,
	};
}

export function toggleMySitesSidebarDesignMenu() {
	return {
		type: MY_SITES_SIDEBAR_DESIGN_TOGGLE,
	};
}

export function toggleMySitesSidebarToolsMenu() {
	return {
		type: MY_SITES_SIDEBAR_TOOLS_TOGGLE,
	};
}

export function toggleMySitesSidebarManageMenu() {
	return {
		type: MY_SITES_SIDEBAR_MANAGE_TOGGLE,
	};
}
