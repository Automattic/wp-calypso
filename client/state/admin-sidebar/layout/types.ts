/**
 * Types for the admin-sidebar layout-delta slice.
 *
 * Mirrors the `LayoutDelta` shape the public plugin's REST endpoint serves
 * and accepts: `{ version, updated_at, overrides: [{ itemId, position }] }`.
 * `Position` carries either a `top_level` slot or an `in_group` slot keyed
 * by `group_id`.
 * @see WordPress/wp-admin-sidebar v0.1.4 src/class-sidebar-rest.php
 * @see WordPress/wp-admin-sidebar v0.1.4 src/customizer/draft-state.js
 */

export type LayoutPositionTopLevel = {
	kind: 'top_level';
	index: number;
};

export type LayoutPositionInGroup = {
	kind: 'in_group';
	group_id: string;
	index: number;
};

export type LayoutPosition = LayoutPositionTopLevel | LayoutPositionInGroup;

export interface LayoutOverride {
	itemId: string;
	position: LayoutPosition;
}

export interface LayoutDelta {
	version: number;
	updated_at: number;
	overrides: LayoutOverride[];
}

export interface AdminSidebarLayoutSlice {
	adminSidebarLayout?: {
		bySite?: Record< string, LayoutDelta >;
	};
}

/**
 * Empty-delta shape returned by the REST endpoint when no override is
 * stored. Matches `Sidebar_Rest::empty_delta()` in v0.1.4.
 */
export const EMPTY_LAYOUT_DELTA: LayoutDelta = Object.freeze( {
	version: 1,
	updated_at: 0,
	overrides: [],
} ) as LayoutDelta;
