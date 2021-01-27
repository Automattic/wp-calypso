/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/* eslint-disable jsdoc/require-param */
/**
 * Fallback nav menu items.
 *
 * These are used as a fallback to ensure that if the API response for menu items
 * fails, the user always sees some menu items. They are required only in the
 * following circumstances:
 *
 * 1. The user has loaded the site for the first time and the Menus API response
 * has yet to be returned or cached in the Browser Storage APIs.
 *
 * 2. The Menu API REST API response fails and there is no response cached in the
 * Browser Storage.
 *
 * As a result of these conditions being an edge case, in most cases the user will
 * not see these menus items. They are a safe guard in case of error.
 *
 * As a rule the menu items are intended to be as close to the anticipated Menus API
 * response as possible but we should not take this too far. We need only show the bear
 * minimum required to navigate in the case that the API response fails.
 */
/* eslint-enable jsdoc/require-param */

const JETPACK_ICON = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" %3E%3Cpath fill="%23a0a5aa" d="M16,0C7.2,0,0,7.2,0,16s7.2,16,16,16s16-7.2,16-16S24.8,0,16,0z"%3E%3C/path%3E%3Cpolygon fill="%23fff" points="15,19 7,19 15,3 "%3E%3C/polygon%3E%3Cpolygon fill="%23fff" points="17,29 17,13 25,13 "%3E%3C/polygon%3E%3C/svg%3E`;
const WPADMIN_ICON = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cmVjdCB4PSIwIiBmaWxsPSJub25lIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiLz48Zz48cGF0aCBmaWxsPSIjZmZmZmZmIiBkPSJNMTIgMkM2LjQ3NyAyIDIgNi40NzcgMiAxMnM0LjQ3NyAxMCAxMCAxMCAxMC00LjQ3NyAxMC0xMFMxNy41MjMgMiAxMiAyek0zLjUgMTJjMC0xLjIzMi4yNjQtMi40MDIuNzM2LTMuNDZMOC4yOSAxOS42NUM1LjQ1NiAxOC4yNzIgMy41IDE1LjM2NSAzLjUgMTJ6bTguNSA4LjVjLS44MzQgMC0xLjY0LS4xMi0yLjQtLjM0NWwyLjU1LTcuNDEgMi42MTMgNy4xNTdjLjAxNy4wNDIuMDM4LjA4LjA2LjExNy0uODg0LjMxLTEuODMzLjQ4LTIuODIzLjQ4em0xLjE3Mi0xMi40ODVjLjUxMi0uMDI3Ljk3My0uMDguOTczLS4wOC40NTgtLjA1NS40MDQtLjcyOC0uMDU0LS43MDIgMCAwLTEuMzc2LjEwOC0yLjI2NS4xMDgtLjgzNSAwLTIuMjQtLjEwNy0yLjI0LS4xMDctLjQ1OC0uMDI2LS41MS42NzQtLjA1My43IDAgMCAuNDM0LjA1NS44OTIuMDgybDEuMzI0IDMuNjMtMS44NiA1LjU3OC0zLjA5Ni05LjIwOGMuNTEyLS4wMjcuOTczLS4wOC45NzMtLjA4LjQ1OC0uMDU1LjQwMy0uNzI4LS4wNTUtLjcwMiAwIDAtMS4zNzYuMTA4LTIuMjY1LjEwOC0uMTYgMC0uMzQ3LS4wMDMtLjU0Ny0uMDFDNi40MTggNS4wMjUgOS4wMyAzLjUgMTIgMy41YzIuMjEzIDAgNC4yMjguODQ2IDUuNzQgMi4yMzItLjAzNy0uMDAyLS4wNzItLjAwNy0uMTEtLjAwNy0uODM1IDAtMS40MjcuNzI3LTEuNDI3IDEuNTEgMCAuNy40MDQgMS4yOTIuODM1IDEuOTkzLjMyMy41NjYuNyAxLjI5My43IDIuMzQ0IDAgLjcyNy0uMjggMS41NzItLjY0NiAyLjc0OGwtLjg0OCAyLjgzMy0zLjA3Mi05LjEzOHptMy4xIDExLjMzMmwyLjU5Ny03LjUwNmMuNDg0LTEuMjEyLjY0NS0yLjE4LjY0NS0zLjA0NCAwLS4zMTMtLjAyLS42MDMtLjA1Ny0uODc0LjY2NCAxLjIxIDEuMDQyIDIuNiAxLjA0MiA0LjA3OCAwIDMuMTM2LTEuNyA1Ljg3NC00LjIyNyA3LjM0N3oiLz48L2c+PC9zdmc+`;

export default function jetpackMenu( { siteDomain } ) {
	return [
		{
			icon: 'dashicons-chart-bar',
			slug: 'stats',
			title: translate( 'Stats' ),
			type: 'menu-item',
			url: `/stats/day/${ siteDomain }`,
		},
		{
			icon: 'dashicons-cart',
			slug: 'upgrades',
			title: translate( 'Upgrades' ),
			type: 'menu-item',
			url: `/plans/${ siteDomain }`,
			children: [
				{
					parent: 'upgrades',
					slug: 'upgrades',
					title: translate( 'Plans' ),
					type: 'submenu-item',
					url: `/plans/${ siteDomain }`,
				},
				{
					parent: 'upgrades',
					slug: 'upgrades',
					title: translate( 'Purchases' ),
					type: 'submenu-item',
					url: `/purchases/subscriptions/${ siteDomain }`,
				},
			],
		},
		{
			icon: 'dashicons-admin-post',
			slug: 'edit-php',
			title: translate( 'Posts' ),
			type: 'menu-item',
			url: `/posts/${ siteDomain }`,
			children: [
				{
					parent: 'edit.php',
					slug: 'edit-php',
					title: translate( 'All Posts' ),
					type: 'submenu-item',
					url: `/posts/${ siteDomain }`,
				},
				{
					parent: 'edit.php',
					slug: 'post-new-php',
					title: translate( 'Add New' ),
					type: 'submenu-item',
					url: `/post/${ siteDomain }`,
				},
			],
		},
		{
			icon: 'dashicons-admin-media',
			slug: 'upload-php',
			title: translate( 'Media' ),
			type: 'menu-item',
			url: `/media/${ siteDomain }`,
		},
		{
			icon: 'dashicons-admin-page',
			slug: 'edit-phppost_typepage',
			title: translate( 'Pages' ),
			type: 'menu-item',
			url: `/pages/${ siteDomain }`,
			children: [
				{
					parent: 'edit.php?post_type=page',
					slug: 'edit-phppost_typepage',
					title: translate( 'All Pages' ),
					type: 'submenu-item',
					url: `/pages/${ siteDomain }`,
				},
				{
					parent: 'edit.php?post_type=page',
					slug: 'post-new-phppost_typepage',
					title: translate( 'Add New' ),
					type: 'submenu-item',
					url: `/page/${ siteDomain }`,
				},
			],
		},
		{
			icon: 'dashicons-admin-comments',
			slug: 'edit-comments-php',
			title: translate( 'Comments' ),
			type: 'menu-item',
			url: `/comments/${ siteDomain }`,
		},
		{
			icon: 'dashicons-feedback',
			slug: 'feedback',
			title: translate( 'Feedback' ),
			type: 'menu-item',
			url: `https://${ siteDomain }/wp-admin/?page=feedback`,
		},
		{
			type: 'separator',
		},
		{
			icon: JETPACK_ICON,
			slug: 'jetpack',
			title: translate( 'Jetpack' ),
			type: 'menu-item',
			url: `/activity-log/${ siteDomain }`,
			children: [
				{
					parent: 'jetpack',
					slug: 'jetpack-activity-log',
					title: translate( 'Activity Log' ),
					type: 'submenu-item',
					url: `/activity-log/${ siteDomain }`,
				},
				{
					parent: 'jetpack',
					slug: 'jetpack-backup',
					title: translate( 'Backup' ),
					type: 'submenu-item',
					url: `/backup/${ siteDomain }`,
				},
				{
					parent: 'jetpack',
					slug: 'jetpack-scan',
					title: translate( 'Scan' ),
					type: 'submenu-item',
					url: `/scan/${ siteDomain }`,
				},
				{
					parent: 'jetpack',
					slug: 'jetpack-search',
					title: translate( 'Search' ),
					type: 'submenu-item',
					url: `/jetpack-search/${ siteDomain }`,
				},
			],
		},
		{
			type: 'separator',
		},
		{
			icon: 'dashicons-admin-appearance',
			slug: 'themes-php',
			title: translate( 'Appearance' ),
			type: 'menu-item',
			url: `/themes/${ siteDomain }`,
			children: [
				{
					parent: 'themes.php',
					slug: 'themes-php',
					title: translate( 'Themes' ),
					type: 'submenu-item',
					url: `/themes/${ siteDomain }`,
				},
				{
					parent: 'themes.php',
					slug: 'themes-customize',
					title: translate( 'Customize' ),
					type: 'submenu-item',
					url: `https://${ siteDomain }/wp-admin/customize.php`,
				},
			],
		},
		{
			icon: 'dashicons-admin-plugins',
			slug: 'plugins',
			title: translate( 'Plugins' ),
			type: 'menu-item',
			url: `/plugins/${ siteDomain }`,
		},
		{
			icon: 'dashicons-admin-users',
			slug: 'users-php',
			title: translate( 'Users' ),
			type: 'menu-item',
			url: `/people/team/${ siteDomain }`,
		},
		{
			icon: 'dashicons-admin-tools',
			slug: 'tools-php',
			title: translate( 'Tools' ),
			type: 'menu-item',
			url: `/marketing/tools/${ siteDomain }`,
			children: [
				{
					parent: 'tools.php',
					slug: 'tools-marketing',
					title: translate( 'Marketing' ),
					type: 'menu-item',
					url: `/marketing/tools/${ siteDomain }`,
				},
				{
					parent: 'tools.php',
					slug: 'tools-earn',
					title: translate( 'Earn' ),
					type: 'menu-item',
					url: `/earn/${ siteDomain }`,
				},
				{
					parent: 'tools.php',
					slug: 'tools-import',
					title: translate( 'Import' ),
					type: 'submenu-item',
					url: `https://${ siteDomain }/wp-admin/import.php?calypsoify=0`,
				},
				{
					parent: 'tools.php',
					slug: 'tools-export',
					title: translate( 'Export' ),
					type: 'submenu-item',
					url: `https://${ siteDomain }/wp-admin/import.php?calypsoify=0`,
				},
			],
		},
		{
			icon: 'dashicons-admin-settings',
			slug: 'options-general-php',
			title: translate( 'Settings' ),
			type: 'menu-item',
			url: `/settings/general/${ siteDomain }`,
		},
		{
			icon: WPADMIN_ICON,
			slug: 'wp-admin',
			title: translate( 'WP Admin' ),
			type: 'menu-item',
			url: `https://${ siteDomain }/wp-admin`,
		},
	];
}
