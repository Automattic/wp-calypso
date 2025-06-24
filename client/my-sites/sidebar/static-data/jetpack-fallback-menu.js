import { translate } from 'i18n-calypso';

/* eslint-disable jsdoc/require-param */
/**
 * Jetpack menu items.
 *
 * These are used for sites that are neither Simple or Atomic.
 */
/* eslint-enable jsdoc/require-param */

const JETPACK_ICON = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 40 40' %3E%3Cpath fill='%23a0a5aa' d='M20 0c11.046 0 20 8.954 20 20s-8.954 20-20 20S0 31.046 0 20 8.954 0 20 0zm11 17H21v19l10-19zM19 4L9 23h10V4z'/%3E%3C/svg%3E`;

export default function jetpackMenu( { siteDomain, hasUnifiedImporter } ) {
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
					slug: 'plans',
					title: translate( 'Plans' ),
					type: 'submenu-item',
					url: `/plans/${ siteDomain }`,
				},
				{
					parent: 'upgrades',
					slug: 'purchases',
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
		},
		{
			icon: 'dashicons-admin-comments',
			slug: 'edit-comments-php',
			title: translate( 'Comments' ),
			type: 'menu-item',
			url: `/comments/all/${ siteDomain }`,
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
					title: translate( 'VaultPress Backup' ),
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
				{
					parent: 'jetpack',
					slug: 'jetpack-forms-admin',
					title: translate( 'Forms' ),
					type: 'submenu-item',
					url: `https://${ siteDomain }/wp-admin/admin.php?page=jetpack-forms-admin`,
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
					type: 'submenu-item',
					url: `/marketing/tools/${ siteDomain }`,
				},
				{
					parent: 'tools.php',
					slug: 'tools-earn',
					title: translate( 'Monetize' ),
					type: 'submenu-item',
					url: `/earn/${ siteDomain }`,
				},
				{
					parent: 'tools.php',
					slug: 'tools-import',
					title: translate( 'Import' ),
					type: 'submenu-item',
					url: hasUnifiedImporter
						? `/import/${ siteDomain }`
						: `https://${ siteDomain }/wp-admin/import.php?calypsoify=0`,
				},
				{
					parent: 'tools.php',
					slug: 'tools-export',
					title: translate( 'Export' ),
					type: 'submenu-item',
					url: `https://${ siteDomain }/wp-admin/export.php?calypsoify=0`,
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
			icon: 'dashicons-wordpress-alt',
			slug: 'wp-admin',
			title: translate( 'WP Admin' ),
			type: 'menu-item',
			url: `https://${ siteDomain }/wp-admin`,
		},
	];
}
