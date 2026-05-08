/**
 * Test fixture for `groupMenuItems()` and the redesigned admin-menu state slice.
 *
 * Derived from the contract doc's "Sample response" section
 * (`a3-schema-contract.md`). Covers:
 *   - Items with `group_id` (Yoast SEO, WooCommerce → `plugins`).
 *   - Items without (Dashboard, Posts, Users → top-level).
 *   - Group with attention (Yoast SEO carries a count of 3).
 *   - Group without attention (an `addons` group with no signal).
 *   - Item with an item-level `signal` whose `attention` is `false` (Users).
 *   - Items with no `signal` field at all (Dashboard, Posts).
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
		slug: 'yoast-seo',
		title: 'Yoast SEO',
		type: 'menu-item',
		url: '/wp-admin/admin.php?page=wpseo_dashboard',
		icon: 'dashicons-chart-area',
		group_id: 'plugins',
		signal: {
			count: 3,
			numeric_badge: null,
			badge: '3',
			inline_text: null,
			inline_icon: null,
			attention: true,
		},
	},
	{
		slug: 'woocommerce',
		title: 'WooCommerce',
		type: 'menu-item',
		url: '/wp-admin/admin.php?page=wc-admin',
		icon: 'dashicons-cart',
		group_id: 'plugins',
		signal: null,
	},
];

export const fixtureGroups: AdminMenuGroup[] = [
	{
		id: 'plugins',
		label: 'My Plugins',
		default_expanded: true,
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
 * `groups[]`. The utility should still preserve those items via the
 * defensive synthesised-metadata path.
 */
export const fixtureMenuOrphanGroup: AdminMenuItem[] = [
	{ slug: 'dashboard', title: 'Dashboard', type: 'menu-item', group_id: null },
	{ slug: 'orphan-1', title: 'Orphan 1', type: 'menu-item', group_id: 'addons' },
	{ slug: 'orphan-2', title: 'Orphan 2', type: 'menu-item', group_id: 'addons' },
];
