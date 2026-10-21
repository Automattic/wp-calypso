/**
 * Test fixture for `groupMenuItems()` and the redesigned admin-menu state slice.
 *
 * Derived from the contract doc's "Sample response" section
 * (`a3-schema-contract.md`). Covers:
 *   - Items with `group_id` (Yoast SEO, WooCommerce, Sensei, Jetpack → `plugins`).
 *   - Items without (Dashboard, Posts, Users → top-level).
 *   - Group with attention.
 *   - Group without attention (an `addons` group with no signal).
 *   - Item with an item-level `signal` whose `attention` is `false` (Users).
 *   - Items with no `signal` field at all (Dashboard, Posts).
 *   - Item firing via the `count` field only with `numeric_badge: null` and
 *     `badge: null` — this is the issue-#39 / public-plugin-PR-#40 path
 *     (Yoast SEO). Without the count-fallback, the group dot fires but no
 *     child shows where the attention is coming from.
 *   - Item firing via `numeric_badge` (Sensei pending awaiting-mod count).
 *   - Item with `inline_text` plan-tier label (Jetpack BETA).
 *   - Item with both `numeric_badge` AND `inline_text` (combined render).
 */

import type { AdminMenuItem, AdminMenuGroup } from 'calypso/state/admin-menu/types';

export const fixtureMenu: AdminMenuItem[] = [
	{
		slug: 'dashboard',
		title: 'Dashboard',
		type: 'menu-item',
		url: '/wp-admin/index.php',
		icon: 'dashicons-dashboard',
		group_id: null,
		signal: null,
	},
	{
		slug: 'posts',
		title: 'Posts',
		type: 'menu-item',
		url: '/wp-admin/edit.php',
		icon: 'dashicons-admin-post',
		group_id: null,
	},
	{
		slug: 'users',
		title: 'Users',
		type: 'menu-item',
		url: '/wp-admin/users.php',
		icon: 'dashicons-admin-users',
		group_id: null,
		signal: {
			count: null,
			numeric_badge: null,
			badge: null,
			inline_text: null,
			inline_icon: null,
			attention: false,
		},
	},
	{
		// Yoast SEO — count-only firing (no `numeric_badge`, no string `badge`).
		// Public plugin issue #39 / PR #40 fix path: without rendering count,
		// the group dot fires but no child indicator is visible.
		slug: 'yoast-seo',
		title: 'Yoast SEO',
		type: 'menu-item',
		url: '/wp-admin/admin.php?page=wpseo_dashboard',
		icon: 'dashicons-chart-area',
		group_id: 'plugins',
		signal: {
			count: 3,
			numeric_badge: null,
			badge: null,
			inline_text: null,
			inline_icon: null,
			attention: true,
		},
	},
	{
		// WooCommerce — no signal whatsoever (plugin item with no pending
		// counts). Renders cleanly with no badge / inline text.
		slug: 'woocommerce',
		title: 'WooCommerce',
		type: 'menu-item',
		url: '/wp-admin/admin.php?page=wc-admin',
		icon: 'dashicons-cart',
		group_id: 'plugins',
		signal: null,
	},
	{
		// Sensei — firing via the public plugin's primary path (`numeric_badge`,
		// extracted from awaiting-mod-style markup with a digit text).
		slug: 'sensei-lms',
		title: 'Sensei LMS',
		type: 'menu-item',
		url: '/wp-admin/admin.php?page=sensei',
		icon: 'dashicons-welcome-learn-more',
		group_id: 'plugins',
		signal: {
			count: null,
			numeric_badge: 5,
			badge: null,
			inline_text: null,
			inline_icon: null,
			attention: true,
		},
	},
	{
		// Jetpack — combined render: `numeric_badge` AND `inline_text` together.
		// Plan-tier label ("BETA") is decorative and does NOT contribute to
		// attention; the count badge fires from `numeric_badge`.
		slug: 'jetpack',
		title: 'Jetpack',
		type: 'menu-item',
		url: '/wp-admin/admin.php?page=jetpack',
		icon: 'dashicons-jetpack',
		group_id: 'plugins',
		signal: {
			count: null,
			numeric_badge: 2,
			badge: null,
			inline_text: 'BETA',
			inline_icon: null,
			attention: true,
		},
	},
];

export const fixtureGroups: AdminMenuGroup[] = [
	{
		id: 'plugins',
		label: 'My Plugins',
		// `default_expanded: false` matches the contract (`a3-schema-contract.md`)
		// and the public plugin's expand-collapse priority chain: stored state
		// wins; else auto-expand-when-current-page-is-inside-group; else
		// collapsed.
		default_expanded: false,
		signal: { attention: true, count: 3 },
	},
];

/** A second fixture: a group whose aggregate signal carries no attention. */
export const fixtureGroupsNoAttention: AdminMenuGroup[] = [
	{
		id: 'addons',
		label: 'Add-ons',
		default_expanded: false,
		signal: { attention: false, count: 0 },
	},
];

export const fixtureMenuWithEmptyGroup: AdminMenuItem[] = [
	{ slug: 'dashboard', title: 'Dashboard', type: 'menu-item', group_id: null },
	{ slug: 'posts', title: 'Posts', type: 'menu-item', group_id: null },
];

/**
 * Edge-case fixture: items reference a `group_id` that has no metadata in
 * `groups[]`. The utility should preserve those items by keeping them
 * ungrouped.
 */
export const fixtureMenuOrphanGroup: AdminMenuItem[] = [
	{ slug: 'dashboard', title: 'Dashboard', type: 'menu-item', group_id: null },
	{ slug: 'orphan-1', title: 'Orphan 1', type: 'menu-item', group_id: 'addons' },
	{ slug: 'orphan-2', title: 'Orphan 2', type: 'menu-item', group_id: 'addons' },
];
