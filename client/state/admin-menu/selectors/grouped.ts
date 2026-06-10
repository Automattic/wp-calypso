/**
 * Memoised selector that returns the grouped admin-menu shape.
 *
 * Reads the cached flat menu from `state.adminMenu.menus[siteId]`, reads
 * companion `groups[]` metadata from `state.adminMenu.groupsBySite[siteId]`,
 * and partitions the result via `groupMenuItems()`.
 *
 * Memoisation: `createSelector` from `@automattic/state-utils` caches by
 * reference identity of the inputs. The same `(menu, groups)` references
 * yield the same `GroupedMenuShape` object identity, so React renderers can
 * rely on shallow-equality checks (e.g. `useSelector`'s default).
 * @see ../../../my-sites/sidebar/utils/group-menu-items.ts
 * @see ../types.ts
 */

import { createSelector } from '@automattic/state-utils';
import groupMenuItems from 'calypso/my-sites/sidebar/utils/group-menu-items';
import 'calypso/state/admin-menu/init';
import { getAdminMenu, getAdminMenuGroups } from './index';
import type { AdminMenuItem, AdminMenuGroup, GroupedMenuShape } from '../types';

/**
 * Partial AppState shape used by the selector. Keeps the public dep surface
 * narrow without pulling in the full `calypso/types` `AppState`.
 */
type AdminMenuState = {
	adminMenu?: {
		menus?: Record< string | number, AdminMenuItem[] | null >;
		groupsBySite?: Record< string | number, AdminMenuGroup[] >;
	};
};

const EMPTY_GROUPED: GroupedMenuShape = Object.freeze( {
	ungroupedItems: [] as AdminMenuItem[],
	groupedSections: [],
} ) as GroupedMenuShape;

/**
 * Get the grouped menu shape for a site. `null` if the site has no cached
 * admin-menu yet.
 * @param state   App state.
 * @param siteId  Site id.
 * @param groups  Optional groups metadata. Until the data layer surfaces it,
 *  pass it explicitly from a one-off prop / fixture. When omitted, every
 *  item ends up in `ungroupedItems` — which is functionally equivalent to
 *  the legacy flat behaviour.
 */
export const getGroupedAdminMenu = createSelector(
	(
		state: AdminMenuState,
		siteId: number | string | null | undefined,
		groups?: AdminMenuGroup[] | null
	): GroupedMenuShape | null => {
		if ( ! siteId ) {
			return null;
		}
		const menu = getAdminMenu( state, siteId );
		if ( ! Array.isArray( menu ) ) {
			return null;
		}
		const resolvedGroups = groups ?? getAdminMenuGroups( state, siteId ) ?? [];
		if ( menu.length === 0 && resolvedGroups.length === 0 ) {
			return EMPTY_GROUPED;
		}
		return groupMenuItems( menu, resolvedGroups );
	},
	(
		state: AdminMenuState,
		siteId: number | string | null | undefined,
		groups?: AdminMenuGroup[] | null
	) => [
		siteId,
		siteId ? state?.adminMenu?.menus?.[ siteId ] : null,
		groups ?? ( siteId ? getAdminMenuGroups( state, siteId ) : null ),
	]
);

export default getGroupedAdminMenu;
