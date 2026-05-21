/**
 * Apply a saved layout delta on top of the flat menu array, returning a new
 * flat array with overrides applied. Mirrors the public plugin's
 * `applyLayoutDelta` (`src/browse-rail/grouping.js` v0.1.4) — only the data
 * model differs (JS arrays vs. live DOM nodes).
 *
 * Semantics (matching the public plugin):
 *
 * - Each override moves the matching item to the position specified.
 * `top_level` overrides set `group_id = null`. `in_group` overrides set
 * `group_id = position.group_id`.
 *
 * - Overrides apply in array order: later overrides land amongst the
 * already-applied earlier siblings.
 *
 * - Stale overrides (itemIds that don't exist in the current menu — typically
 * a deactivated plugin) are silently skipped. The storage record stays
 * untouched so the position re-applies on reactivation. See plan
 * 03-contracts.md § 3 (stale-item preservation).
 *
 * - Index is clamped against the destination bucket's length so out-of-range
 * indices land at the end rather than no-op.
 *
 * - Items without an `itemId` field can't be matched and are left in place
 * (the redesigned endpoint emits `itemId` for every item; legacy items
 * that haven't been classified yet pass through unmodified).
 *
 * The output is a fresh array; the input is not mutated.
 * @see WordPress/wp-admin-sidebar v0.1.4 src/browse-rail/grouping.js#applyLayoutDelta
 * @see WordPress/wp-admin-sidebar v0.1.4 src/customizer/draft-state.js
 */

import type { AdminMenuItem } from 'calypso/state/admin-menu/types';
import type { LayoutDelta } from 'calypso/state/admin-sidebar/layout/types';

/**
 * Per the schema contract, every redesigned-endpoint item carries an
 * `itemId`. Legacy items don't — they pass through unchanged.
 */
type ItemId = string;

/**
 * Apply layout delta to the flat menu array. Returns a new array; input is
 * not mutated.
 */
export function applyLayoutDelta(
	menu: readonly AdminMenuItem[] | null | undefined,
	delta: LayoutDelta | null | undefined
): AdminMenuItem[] {
	if ( ! Array.isArray( menu ) ) {
		return [];
	}
	if ( ! delta || ! Array.isArray( delta.overrides ) || delta.overrides.length === 0 ) {
		return menu.slice();
	}

	// Index items by `itemId` for O(1) lookup. Items without an `itemId` (or
	// with a non-string value) can't be relocated; we collect them in
	// document order so they pass through untouched.
	const byId = new Map< ItemId, AdminMenuItem >();
	for ( const item of menu ) {
		const itemId =
			item && typeof ( item as AdminMenuItem & { itemId?: unknown } ).itemId === 'string'
				? ( ( item as AdminMenuItem & { itemId: string } ).itemId as ItemId )
				: null;
		if ( itemId ) {
			byId.set( itemId, item );
		}
	}

	// Build the working menu as a copy. Each override mutates this copy in
	// place (we then snapshot it to a fresh array at the end so callers
	// receive a stable reference).
	const working = menu.slice();

	for ( const override of delta.overrides ) {
		if ( ! override || typeof override !== 'object' ) {
			continue;
		}
		const itemId = typeof override.itemId === 'string' ? override.itemId : null;
		const position = override.position;
		if ( ! itemId || ! position || typeof position !== 'object' ) {
			continue;
		}
		const item = byId.get( itemId );
		if ( ! item ) {
			// Stale override (item not present in this menu). Silently skip —
			// the saved record stays in storage so it re-applies if the
			// item comes back.
			continue;
		}
		const targetGroupId =
			position.kind === 'in_group' && typeof position.group_id === 'string'
				? position.group_id
				: null;

		// Apply group-id rebinding so the renderer routes the item into the
		// destination bucket (top-level vs. specific group).
		const updated: AdminMenuItem = {
			...item,
			group_id: targetGroupId,
		};
		byId.set( itemId, updated );

		// Pull the item out of the working array. Its destination index is
		// computed against the bucket the override targets.
		const sourceIdx = working.indexOf( item );
		if ( sourceIdx !== -1 ) {
			working.splice( sourceIdx, 1 );
		}

		// Find every other item already routing to the target bucket (in the
		// post-override view) and pick the slot the override asks for. Index
		// is clamped against the bucket length.
		const bucket: number[] = [];
		for ( let i = 0; i < working.length; i++ ) {
			const candidate = working[ i ];
			const candidateGroupId =
				candidate && typeof candidate.group_id === 'string' ? candidate.group_id : null;
			if ( candidateGroupId === targetGroupId ) {
				bucket.push( i );
			}
		}
		const requested = Number.isFinite( position.index ) ? Math.floor( position.index ) : 0;
		const slot = Math.max( 0, Math.min( requested, bucket.length ) );

		// Convert bucket-local slot to working-array index. `slot === bucket.length`
		// means "after the last bucket member" — append to working at the
		// position right after the last one (or at the end if the bucket is empty).
		let insertIdx;
		if ( bucket.length === 0 ) {
			// No other items in the bucket yet. Append at the end so the
			// renderer sees a single-member bucket.
			insertIdx = working.length;
		} else if ( slot === bucket.length ) {
			insertIdx = bucket[ bucket.length - 1 ] + 1;
		} else {
			insertIdx = bucket[ slot ];
		}
		working.splice( insertIdx, 0, updated );
	}

	return working;
}

export default applyLayoutDelta;
