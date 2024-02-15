import { translate } from 'i18n-calypso';

/**
 * Menu items for the Global Site View sidebar.
 * TODO: Update all icons
 */
export default function globalSiteViewSidebarMenu( {
	shouldShowAddOns,
	showSiteMonitoring,
	siteDomain,
}: {
	shouldShowAddOns: boolean;
	showSiteMonitoring: boolean;
	siteDomain: string;
} ) {
	return [
		{
			icon: 'dashicons-arrow-left-alt2',
			slug: 'all-sites',
			title: translate( 'All sites' ),
			type: 'menu-item',
			url: `/sites`,
		},

		{
			type: 'separator',
		},
		{
			icon: 'dashicons-admin-home',
			slug: 'home',
			title: translate( 'Home' ),
			type: 'menu-item',
			url: `/home/${ siteDomain }`,
		},

		/**
		 * ACCOUNT section
		 * TODO: We need to render the "ACCOUNT" label.
		 */
		{
			type: 'separator',
		},
		{
			icon: 'dashicons-admin-home',
			slug: 'upgrades',
			title: translate( 'Plans' ),
			type: 'menu-item',
			url: `/plans/${ siteDomain }`,
		},
		...( shouldShowAddOns
			? [
					{
						icon: 'dashicons-admin-home',
						slug: 'Add-Ons',
						title: translate( 'Add-Ons' ),
						type: 'menu-item',
						url: `/add-ons/${ siteDomain }`,
					},
			  ]
			: [] ),
		{
			icon: 'dashicons-admin-home',
			slug: 'domains',
			title: translate( 'Domains' ),
			navigationLabel: translate( 'Manage all domains' ),
			type: 'menu-item',
			url: `/domains/manage/${ siteDomain }`,
		},
		{
			icon: 'dashicons-admin-home',
			slug: 'Emails',
			title: translate( 'Emails' ),
			type: 'menu-item',
			url: `/email/${ siteDomain }`,
		},
		{
			icon: 'dashicons-admin-home',
			slug: 'Purchases',
			title: translate( 'Purchases' ),
			type: 'menu-item',
			url: `/purchases/subscriptions/${ siteDomain }`,
		},

		/**
		 * SITE section
		 * TODO: We need to render the "SITE" label.
		 */
		{
			type: 'separator',
		},
		{
			icon: 'dashicons-admin-home',
			slug: 'options-hosting-configuration-php',
			title: translate( 'Hosting' ),
			type: 'menu-item',
			url: `/hosting-config/${ siteDomain }`,
		},
		{
			icon: 'dashicons-admin-home',
			slug: 'settings-site-tools',
			title: translate( 'Tools' ),
			type: 'menu-item',
			url: `/settings/site-tools/${ siteDomain }`,
		},
		...( showSiteMonitoring
			? [
					{
						icon: 'dashicons-admin-home',
						slug: 'tools-site-monitoring',
						title: translate( 'Monitoring' ),
						type: 'menu-item',
						url: `/site-monitoring/${ siteDomain }`,
					},
			  ]
			: [] ),

		/**
		 * GROW section
		 * TODO: We need to render the "GROW" label.
		 */
		{
			type: 'separator',
		},
		{
			icon: 'dashicons-admin-home',
			slug: 'tools-earn',
			title: translate( 'Monetize' ),
			type: 'menu-item',
			url: `/earn/${ siteDomain }`,
		},
		{
			icon: 'dashicons-admin-home',
			slug: 'options-podcasting-php',
			title: translate( 'Podcasting' ),
			type: 'menu-item',
			url: `/settings/podcasting/${ siteDomain }`,
		},
		{
			icon: 'dashicons-admin-home',
			slug: 'subscribers',
			title: translate( 'Subscribers' ),
			type: 'menu-item',
			url: `/subscribers/${ siteDomain }`,
		},
	];
}
