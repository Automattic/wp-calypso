/**
 * Selectors for the admin-sidebar layout-delta slice.
 *
 * Returns the saved delta for a site, or `null` when nothing is stored.
 * The renderer applies overrides over the baseline menu (mirrors the public
 * plugin's `applyLayoutDelta` in `src/browse-rail/grouping.js` v0.1.4).
 */

import 'calypso/state/admin-sidebar/layout/init';

import type { AdminSidebarLayoutSlice, LayoutDelta } from './types';

/**
 * Returns the saved layout delta for the given `siteId`, or `null` when
 * nothing is stored. The customizer's draft-state initialiser treats
 * `null` as "no saved delta yet" and bootstraps an empty delta.
 */
export function getAdminSidebarLayout(
	state: AdminSidebarLayoutSlice,
	siteId: number | string | null | undefined
): LayoutDelta | null {
	if ( ! siteId ) {
		return null;
	}
	const value = state?.adminSidebarLayout?.bySite?.[ String( siteId ) ];
	return value ?? null;
}
