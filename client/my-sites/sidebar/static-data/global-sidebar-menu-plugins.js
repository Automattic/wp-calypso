import { chevronLeft, Icon } from '@wordpress/icons';
import { translate } from 'i18n-calypso';

/**
 * Menu items that support plugins section screen.
 */
export default function globalSidebarMenuPlugins() {
	return [
		{
			icon: <Icon icon={ chevronLeft } />,
			slug: 'sites',
			title: translate( 'Sites' ),
			navigationLabel: translate( 'Manage all my sites' ),
			type: 'menu-item',
			url: '/sites',
		},
		{ type: 'separator' },
		{
			icon: 'dashicons-calendar-alt',
			slug: 'plugins/scheduled-updates',
			title: translate( 'Scheduled Updates' ),
			navigationLabel: translate( 'Scheduled Updates' ),
			type: 'menu-item',
			url: '/plugins/scheduled-updates',
		},
	];
}
