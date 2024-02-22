import { translate } from 'i18n-calypso';

/**
 * Menu items that support all sites screen.
 */
export default function globalSidebarMenu() {
	return [
		{
			slug: 'sites',
			title: translate( 'Sites' ),
			navigationLabel: translate( 'Manage all my sites' ),
			type: 'menu-item',
			url: '/sites',
		},
		{
			slug: 'domains',
			title: translate( 'Domains' ),
			navigationLabel: translate( 'Manage all domains' ),
			type: 'menu-item',
			url: '/domains/manage',
		},
	];
}
