import { translate } from 'i18n-calypso';

/**
 * Menu items that support all sites screen.
 * @param {Object} options
 * @param {boolean} options.showManagePlugins Includes menu items that can manage plugins across all sites.
 */
export default function allSitesMenu( { showManagePlugins = false } = {} ) {
	return [
		{
			icon: 'dashicons-admin-home',
			slug: 'sites',
			title: translate( 'My Sites' ),
			navigationLabel: translate( 'Manage all my sites' ),
			type: 'menu-item',
			url: '/sites',
		},
		{
			icon: 'dashicons-admin-site-alt3',
			slug: 'domains',
			title: translate( 'Domains' ),
			navigationLabel: translate( 'Manage all domains' ),
			type: 'menu-item',
			url: '/domains/manage',
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
