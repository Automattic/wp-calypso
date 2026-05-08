/**
 * Memoised selector that returns the grouped admin-menu shape.
 *
 * Reads the cached flat menu from `state.adminMenu.menus[siteId]` and
 * partitions it via `groupMenuItems()`. Groups metadata travels through the
 * response; until the data layer is updated to surface it (Phase 1 task 1.1
 * lock-step), callers can pass `groups[]` explicitly. When the endpoint
 * starts emitting `groups[]`, the data-layer normalizer at
 * `state/data-layer/wpcom/sites/admin-menu` will dispatch a new
 * `ADMIN_MENU_GROUPS_RECEIVE` action and a separate `groupsBySite` reducer
 * will surface the value through state — at which point this selector reads
 * from state directly.
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
import { getAdminMenu } from './index';
import type { AdminMenuItem, AdminMenuGroup, GroupedMenuShape } from '../types';

/**
 * Partial AppState shape used by the selector. Keeps the public dep surface
 * narrow without pulling in the full `calypso/types` `AppState`.
 */
type AdminMenuState = {
	adminMenu?: {
		menus?: Record< string | number, AdminMenuItem[] | null >;
		// Future: a `groupsBySite` slice will land here in lock-step with the
		// endpoint emitting `groups[]`. Today this field is undefined.
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
		const resolvedGroups = groups ?? state?.adminMenu?.groupsBySite?.[ siteId ] ?? [];
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
		groups ?? ( siteId ? state?.adminMenu?.groupsBySite?.[ siteId ] : null ),
	]
);

export default getGroupedAdminMenu;
