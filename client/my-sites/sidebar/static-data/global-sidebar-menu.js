import { category, Icon, brush } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import ReaderP2Icon from 'calypso/reader/components/icons/p2-icon';

export const SidebarIconPlugins = () => (
	<svg
		className="sidebar__menu-icon svg-plugins"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M10.5 4L10.5 8H13.5V4H15V8H16.5C17.0523 8 17.5 8.44772 17.5 9V13L14.5 17V19C14.5 19.5523 14.0523 20 13.5 20H10.5C9.94772 20 9.5 19.5523 9.5 19V17L6.5 13V9C6.5 8.44772 6.94772 8 7.5 8H9L9 4H10.5ZM11 16.5V18.5H13V16.5L16 12.5V9.5H8V12.5L11 16.5Z"
		/>
	</svg>
);

/**
 * Menu items that support all sites screen.
 */
export default function globalSidebarMenu() {
	return [
		{
			icon: <Icon icon={ category } className="sidebar__menu-icon svg_all-sites" size={ 24 } />,
			slug: 'sites',
			title: translate( 'Sites' ),
			navigationLabel: translate( 'Manage all my sites' ),
			type: 'menu-item',
			url: '/sites',
		},
		{
			icon: <ReaderP2Icon />,
			slug: 'sites-p2',
			title: translate( 'P2s' ),
			navigationLabel: translate( 'Manage all my P2 sites' ),
			type: 'menu-item',
			url: '/p2s',
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
			icon: <Icon icon={ brush } size={ 24 } className="sidebar__menu-icon" />,
			slug: 'themes',
			title: translate( 'Themes' ),
			navigationLabel: translate( 'Themes' ),
			type: 'menu-item',
			url: '/themes',
		},
		{
			icon: <SidebarIconPlugins />,
			slug: 'plugins',
			title: translate( 'Plugins' ),
			navigationLabel: translate( 'Plugins' ),
			type: 'menu-item',
			url: '/plugins',
			forceChevronIcon: true,
		},
	];
}
