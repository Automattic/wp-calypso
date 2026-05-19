/**
 * Pure data-transform that partitions a flat admin-menu array into the shape
 * the redesigned `<MySitesSidebarUnified>` renderer consumes.
 *
 * Mirrors the public plugin's `wrapIntoGroups` (`src/browse-rail/grouping.js`
 * v0.1.4) exactly:
 *
 * - Items with `group_id == null` (or missing) stay flat at top-level
 * (`ungroupedItems`), in their original input order. **Per the recent
 * design call, "Calypso-link items stay flat at top-level"** — there is
 * no `wordpress-com` group; Home / Hosting / Upgrades / WordPress.com
 * Plugins remain ungrouped.
 *
 * - Items with a non-null `group_id` collect into `groupedSections`. Group
 * order follows the input metadata (`groups[]` from the response). Inside
 * each group, items keep their original input order — no resorting on
 * the client side. The `default_weight` ordering happens server-side in
 * `Sidebar_Classifier::build_nav_model()`.
 *
 * - Groups that have zero matching items are dropped (no empty headers
 * in the rendered tree). This mirrors the public plugin's "only insert
 * the group container if at least one item moved" rule
 * (grouping.js:322-324).
 *
 * - Position rule: each group renders at the position of its first
 * matching item. The plan calls this "first plugin slot wins" — issue
 * #26 may pin the group to a deterministic position later, but the
 * default mirrors the public plugin's emit order today. Top-level items
 * ordering is preserved verbatim; the rendered tree weaves the group
 * placeholder into `ungroupedItems` at the slot the renderer chooses
 * (today: groups append after all top-level items, matching v0.1.4).
 *
 * Output shape is intentionally partitioned (rather than an inline `__group`
 * sentinel) so consumers can iterate `ungroupedItems` and `groupedSections`
 * independently. The renderer in `body.jsx` decides when to interleave them.
 * @see WordPress/wp-admin-sidebar v0.1.4 src/browse-rail/grouping.js
 * @see ../../../state/admin-menu/types.ts
 */

import type {
	AdminMenuItem,
	AdminMenuGroup,
	GroupedMenuShape,
	GroupedMenuSection,
} from 'calypso/state/admin-menu/types';

/**
 * Partition a flat menu array into top-level + per-group sections, using the
 * top-level `groups[]` metadata to attach group identity (label, default
 * expanded state, aggregate signal) to each section.
 *
 * Pure / referentially transparent: same inputs produce the same output. The
 * output object identity changes on every call so consumers should memoise
 * upstream (the selector at `client/state/admin-menu/selectors/grouped.ts`
 * does this via `createSelector`).
 * @param menu  Flat menu array as returned from `/wpcom/v2/admin-menu`.
 * @param groups Optional `groups[]` metadata. If omitted or empty, every item
 *  ends up in `ungroupedItems` and `groupedSections` is empty. Items with a
 *  `group_id` that isn't present in `groups[]` are treated as ungrouped — a
 *  defensive choice that matches the public plugin's "drop items with no
 *  matching group" behaviour.
 */
export function groupMenuItems(
	menu: readonly AdminMenuItem[] | null | undefined,
	groups: readonly AdminMenuGroup[] | null | undefined = []
): GroupedMenuShape {
	if ( ! Array.isArray( menu ) || menu.length === 0 ) {
		return { ungroupedItems: [], groupedSections: [] };
	}

	const groupsList = Array.isArray( groups ) ? groups : [];
	const groupsById = new Map< string, AdminMenuGroup >();
	for ( const group of groupsList ) {
		if ( group && typeof group.id === 'string' ) {
			groupsById.set( group.id, group );
		}
	}

	// Bucket items by `group_id`. Items with no matching group fall back to
	// ungrouped — same defensive degradation as the public plugin.
	const ungroupedItems: AdminMenuItem[] = [];
	const itemsByGroupId = new Map< string, AdminMenuItem[] >();

	for ( const item of menu ) {
		const groupId = typeof item?.group_id === 'string' ? item.group_id : null;
		if ( ! groupId || ! groupsById.has( groupId ) ) {
			ungroupedItems.push( item );
			continue;
		}
		if ( ! itemsByGroupId.has( groupId ) ) {
			itemsByGroupId.set( groupId, [] );
		}
		itemsByGroupId.get( groupId )!.push( item );
	}

	// Emit groups in `groups[]` metadata order (the canonical server-side
	// ordering), filtered to those that actually picked up at least one item.
	const seenGroupIds = new Set< string >();
	const groupedSections: GroupedMenuSection[] = [];
	for ( const group of groupsList ) {
		if ( seenGroupIds.has( group.id ) ) {
			continue;
		}
		seenGroupIds.add( group.id );
		const items = itemsByGroupId.get( group.id );
		if ( ! items || items.length === 0 ) {
			continue;
		}
		groupedSections.push( { group, items } );
	}

	return { ungroupedItems, groupedSections };
}

export default groupMenuItems;
