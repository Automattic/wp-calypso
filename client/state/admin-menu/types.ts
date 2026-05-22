/**
 * Types for the admin-menu state slice.
 *
 * Companion contract for the redesigned `/wpcom/v2/admin-menu` response:
 * existing fields stay as-is; the redesign adds optional classifier fields
 * (`itemId`, `source`, `default_weight`, `reassignable`, `group_id`,
 * `signal`) and a top-level `groups[]` array describing group identity +
 * aggregated signal.
 *
 * Both Phase 1 task 1.1 (Jetpack endpoint, `class_exists( 'Sidebar_Classifier' )`
 * guarded) and Phase 1 tasks 1.3/1.4 (this file's consumers) build from this
 * shape. Field naming uses `snake_case` for new structural / signal fields per
 * the schema contract — these come from the API verbatim, the JS-side
 * identifiers stay `camelCase`.
 *
 * Behavioural anchor: `WordPress/wp-admin-sidebar` v0.1.4 (in-tree-copy at
 * `Automattic/wpcom:wp-content/mu-plugins/wp-admin-sidebar/`). The grouping
 * algorithm + group-header DOM mirror that plugin's `src/browse-rail/grouping.js`
 * + `src/browse-rail/styles.css` 1:1; only the runtime (React vs. vanilla DOM)
 * differs.
 */

/**
 * A single signal blob attached to a menu item. `null` for items that
 * produced no signal — most items are `null`. The fields preserve the public
 * plugin's mixed convention: `count` and `numeric_badge` are extracted from
 * the source HTML's `update-plugins`/`awaiting-mod` markup; `attention` is the
 * OR of the count-bearing fields plus a non-empty `badge` string.
 */
export interface AdminMenuSignal {
	/** Numeric "count" extracted from `update-plugins`-style markup. */
	count: number | null;
	/** Numeric badge extracted from `awaiting-mod`-style markup. */
	numeric_badge: number | null;
	/** Non-empty non-numeric badge text. Rare; defensive. */
	badge: string | null;
	/** Plan-tier label (e.g. "Premium", "BETA"). Decorative — does NOT contribute to attention. */
	inline_text: string | null;
	/** Inline icon glyph (dashicon slug) if present. */
	inline_icon: string | null;
	/** OR of (`count > 0`, `numeric_badge > 0`, non-empty `badge`). Drives the group-level dot. */
	attention: boolean;
}

/**
 * Existing Calypso admin-menu item shape, with the redesign's optional
 * additions. `slug`/`title`/`type`/`url`/`icon`/`children` are the legacy
 * fields the endpoint already returns. Classifier fields are optional,
 * consumers that ignore them keep the legacy flat behaviour.
 */
export interface AdminMenuItem {
	slug: string;
	title: string;
	type: string;
	url?: string;
	icon?: string;
	badge?: string;
	count?: number;
	inlineIcon?: string;
	parent?: string;
	children?: AdminMenuItem[];
	/** Compound item identifier used by customize-mode layout deltas. */
	itemId?: string;
	/** Classifier source, e.g. `"core"`, `"plugin"`, or `"wpcom"`. */
	source?: string;
	/** Default ordering hint from the classifier. */
	default_weight?: number;
	/** Whether customize mode may move this item. */
	reassignable?: boolean;
	/** The group this item belongs to (e.g. `"plugins"`). `null` / undefined = top-level. */
	group_id?: string | null;
	/** Attention / count / badge metadata. `null` if the item produced no signal. */
	signal?: AdminMenuSignal | null;
}

/**
 * Top-level group entry alongside `menu[]` in the response. The canonical
 * source for the rendered group label, default expanded state, and the
 * aggregated signal that drives the collapsed-state attention dot.
 */
export interface AdminMenuGroup {
	/** Group id, e.g. `"plugins"`. Items join groups via their own `group_id`. */
	id: string;
	/** Display label, i18n-aware on the wp-admin side. */
	label: string;
	/** Whether the group starts expanded if the user has no stored state. */
	default_expanded: boolean;
	/** Aggregated signal — drives the collapsed-state group-header dot. */
	signal: {
		/** Any child has attention? */
		attention: boolean;
		/** Sum of children's `count` + `numeric_badge`. */
		count: number;
	};
}

export type AdminMenuLayoutPosition =
	| {
			kind: 'top_level';
			index: number;
	  }
	| {
			kind: 'in_group';
			group_id: string;
			index: number;
	  };

export interface AdminMenuLayoutDelta {
	version: number;
	updated_at?: number;
	overrides: Array< {
		itemId: string;
		position: AdminMenuLayoutPosition;
	} >;
	cleared?: string[];
}

/**
 * The `/wpcom/v2/admin-menu` response shape Calypso reads. The legacy endpoint
 * returns a flat `AdminMenuItem[]`; the redesigned envelope returns this shape.
 */
export interface AdminMenuResponse {
	menu: AdminMenuItem[];
	groups?: AdminMenuGroup[];
	layoutDelta?: AdminMenuLayoutDelta;
}

/**
 * The shape produced by `groupMenuItems()` — what the sidebar renderer
 * consumes incrementally. Items inside a `groupedSections[i].items` retain
 * their original input order (no resorting); ungrouped items keep their
 * original positions in `ungroupedItems`.
 *
 * Per the Lucas design call (recorded in `a3-planning.md` § 7), Calypso-link
 * items stay flat at top-level (no `wordpress-com` group). Only items with a
 * non-null `group_id` join a group.
 */
export interface GroupedMenuShape {
	/** Items with `group_id == null` (or missing). Kept in original order. */
	ungroupedItems: AdminMenuItem[];
	/** One entry per group that has at least one item, in first-encounter order. */
	groupedSections: GroupedMenuSection[];
}

export interface GroupedMenuSection {
	/** The group metadata from the response's `groups[]`. */
	group: AdminMenuGroup;
	/** Items belonging to this group, in original input order. */
	items: AdminMenuItem[];
}

/**
 * Per-user, per-site, per-group expand/collapse state. Stored in the
 * `adminSidebarExpandState` slice; key format: `state.adminSidebarExpandState[siteId][groupId] = boolean`.
 *
 * `true` = expanded, `false` = collapsed, missing = use the group's
 * `default_expanded` from the response.
 */
export interface AdminSidebarExpandState {
	[ siteId: string ]: {
		[ groupId: string ]: boolean;
	};
}
