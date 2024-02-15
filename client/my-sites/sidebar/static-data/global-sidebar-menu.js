import { translate } from 'i18n-calypso';

/**
 * Menu items that support all sites screen.
 */
export default function globalSidebarMenu() {
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
	];
}
