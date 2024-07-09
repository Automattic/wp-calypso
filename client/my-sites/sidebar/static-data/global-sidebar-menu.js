import { category, Icon, brush } from '@wordpress/icons';
import { translate } from 'i18n-calypso';

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
		{
			icon: (
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="sidebar__menu-icon sidebar_svg-reader"
				>
					<path
						d="M0.94437 12.8443L0 12.7787V11.2808L1.05696 11.2293C1.79454 8.80551 3.32944 7.30531 5.84548 7.20451C8.327 7.10841 9.9814 8.45861 10.9005 10.8144C11.2322 10.6198 11.6082 10.5174 11.9908 10.5174C12.3734 10.5174 12.7494 10.6198 13.0811 10.8144C14.0415 8.42811 15.7166 7.06391 18.2533 7.21391C20.7165 7.35451 22.2124 8.85471 22.9361 11.2316L23.9931 11.2808V12.7248C23.9403 12.7552 23.9058 12.7974 23.8782 12.7927C23.1889 12.6873 22.9775 13.0037 22.8167 13.6788C22.2307 16.1377 20.0295 17.652 17.4629 17.4715C15.1652 17.3097 13.2327 15.3618 12.9248 12.924C12.8889 12.6917 12.7743 12.4796 12.6009 12.3245C12.4275 12.1695 12.2064 12.0814 11.9759 12.0755C11.752 12.0855 11.5383 12.1739 11.3708 12.326C11.2034 12.478 11.0925 12.6842 11.0568 12.9099C10.7236 15.4884 8.7062 17.4082 6.2453 17.4855C3.63734 17.5676 1.56706 15.8775 1.04317 13.2405C1.03168 13.1092 0.98343 12.9896 0.94437 12.8443ZM5.99942 15.9385C6.9365 15.946 7.8384 15.5742 8.5072 14.9045C9.1761 14.2349 9.5575 13.3221 9.5678 12.3661C9.5727 11.4108 9.2057 10.4925 8.5474 9.81301C7.8891 9.13351 6.9933 8.74841 6.0569 8.74221C5.11956 8.73471 4.21764 9.10691 3.54906 9.77711C2.88048 10.4473 2.49985 11.3607 2.49075 12.3169C2.48773 12.7906 2.57643 13.2602 2.75175 13.6989C2.92707 14.1375 3.18556 14.5365 3.5124 14.873C3.83924 15.2095 4.228 15.4768 4.65637 15.6596C5.08473 15.8425 5.54426 15.9372 6.0086 15.9385H5.99942ZM17.9615 15.9385C18.899 15.9385 19.7981 15.5587 20.4612 14.8827C21.1243 14.2066 21.4971 13.2897 21.4977 12.3333C21.4929 11.3773 21.1167 10.4623 20.4517 9.78871C19.7867 9.11521 18.8871 8.73801 17.95 8.73991C17.0126 8.73991 16.1134 9.11961 15.4503 9.79561C14.7872 10.4717 14.4144 11.3887 14.4138 12.345C14.4159 12.8194 14.5096 13.2887 14.6895 13.7261C14.8694 14.1635 15.1319 14.5605 15.4622 14.8944C15.7925 15.2283 16.1841 15.4926 16.6145 15.6721C17.0449 15.8517 17.5057 15.943 17.9707 15.9408L17.9615 15.9385Z"
						fill="black"
					/>
				</svg>
			),
			slug: 'reader',
			title: translate( 'Reader' ),
			navigationLabel: translate( 'Reader' ),
			type: 'menu-item',
			url: '/read',
			forceChevronIcon: true,
		},
	];
}
