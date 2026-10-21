/**
 * Action creators for the admin-sidebar group expand/collapse slice.
 *
 * Mirrors the toggle behaviour in the public plugin's
 * `src/browse-rail/expand-collapse.js`: a single `toggle` action flips the
 * stored boolean; `setExpanded` is for callers that need explicit control
 * (e.g. auto-expand on URL match — Phase 2 work that derives from current
 * route, not from this slice).
 */

import {
	ADMIN_SIDEBAR_GROUP_TOGGLE,
	ADMIN_SIDEBAR_GROUP_SET_EXPANDED,
} from 'calypso/state/action-types';

import 'calypso/state/admin-sidebar/expand-state/init';

export const toggleAdminSidebarGroup = ( siteId: number | string, groupId: string ) =>
	( {
		type: ADMIN_SIDEBAR_GROUP_TOGGLE,
		siteId,
		groupId,
	} ) as const;

export const setAdminSidebarGroupExpanded = (
	siteId: number | string,
	groupId: string,
	expanded: boolean
) =>
	( {
		type: ADMIN_SIDEBAR_GROUP_SET_EXPANDED,
		siteId,
		groupId,
		expanded,
	} ) as const;
