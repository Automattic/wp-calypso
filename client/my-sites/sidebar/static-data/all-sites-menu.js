import { translate } from 'i18n-calypso';

/* eslint-disable jsdoc/require-param */
/**
 * Menu items that support all sites screen.
 */
/* eslint-enable jsdoc/require-param */

export default function allSitesMenu( { showManagePlugins = false } ) {
	return [
		{
			icon: 'dashicons-chart-bar',
			slug: 'stats',
			title: translate( 'Stats' ),
			navigationLabel: translate( 'View stats for all sites' ),
			type: 'menu-item',
			url: '/stats/day',
		},
		{
			icon: 'dashicons-cart',
			slug: 'upgrades',
			title: translate( 'Domains' ),
			navigationLabel: translate( 'View domains for all sites' ),
			type: 'menu-item',
			url: '/domains/manage',
		},
		{
			icon: 'dashicons-admin-post',
			slug: 'edit-php',
			title: translate( 'Posts' ),
			navigationLabel: translate( 'View posts for all sites' ),
			type: 'menu-item',
			url: '/posts',
		},
		{
			icon: 'dashicons-admin-page',
			slug: 'edit-phppost_typepage',
			title: translate( 'Pages' ),
			navigationLabel: translate( 'View pages for all sites' ),
			type: 'menu-item',
			url: '/pages',
		},
		{
			icon: 'dashicons-admin-plugins',
			slug: 'plugins',
			title: translate( 'Plugins' ),
			navigationLabel: translate( 'View plugins for all sites' ),
			type: 'menu-item',
			url: '/plugins',
			...( showManagePlugins && {
				children: [
					{
						parent: 'plugins',
						slug: 'all-sites-plugins-add-new',
						title: translate( 'Add New' ),
						type: 'submenu-item',
						url: '/plugins',
					},
					{
						parent: 'plugins',
						slug: 'all-sites-plugins-installed-plugins',
						title: translate( 'Installed Plugins' ),
						type: 'submenu-item',
						url: '/plugins/manage',
					},
				],
			} ),
		},
	];
}
