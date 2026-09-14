/**
 * Selectors for the admin-sidebar group expand/collapse slice.
 *
 * The slice stores explicit user toggles only — items absent from the slice
 * are not implicitly collapsed; the component falls back to the group's
 * `default_expanded` from the response shape. The selector returns the
 * stored value or `undefined` if the user has not toggled the group yet.
 */

import 'calypso/state/admin-sidebar/expand-state/init';

type AdminSidebarExpandStateSlice = {
	adminSidebarExpandState?: {
		bySite?: Record< string, Record< string, boolean > >;
	};
};

/**
 * Returns the user's stored expanded/collapsed value for `(siteId, groupId)`,
 * or `undefined` if the user has not toggled the group yet.
 */
export function getAdminSidebarGroupExpanded(
	state: AdminSidebarExpandStateSlice,
	siteId: number | string | null | undefined,
	groupId: string | null | undefined
): boolean | undefined {
	if ( ! siteId || ! groupId ) {
		return undefined;
	}
	const value = state?.adminSidebarExpandState?.bySite?.[ String( siteId ) ]?.[ groupId ];
	return typeof value === 'boolean' ? value : undefined;
}

/**
 * Returns the entire stored map for a site as `{ [groupId]: boolean }`. Used
 * for bulk operations (e.g. expanding all groups when entering customize
 * mode in Phase 2).
 */
export function getAdminSidebarExpandedBySite(
	state: AdminSidebarExpandStateSlice,
	siteId: number | string | null | undefined
): Record< string, boolean > {
	if ( ! siteId ) {
		return {};
	}
	return state?.adminSidebarExpandState?.bySite?.[ String( siteId ) ] ?? {};
}
