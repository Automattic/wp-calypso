import { translate } from 'i18n-calypso';

/**
 * Menu items that support all sites screen.
 */
export default function allSitesMenu() {
	return [
		{
			icon: 'dashicons-admin-home',
			slug: 'sites',
			title: translate( 'Sites' ),
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
			type: 'separator',
		},
		{
			icon: 'custom-icon-reader',
			slug: 'reader',
			title: translate( 'Reader' ),
			navigationLabel: translate( 'View plugins for all sites' ),
			type: 'menu-item',
			url: '/read',
		},
		{
			icon: 'custom-icon-notifications',
			slug: 'notifications',
			title: translate( 'Notifications' ),
			navigationLabel: translate( 'View all notifications' ),
			type: 'custom-menu-item',
			url: '/read/notifications',
		},
	];
}
