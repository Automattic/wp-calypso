import { translate } from 'i18n-calypso';

/**
 * Menu items for the Global Site View sidebar.
 */
export default function globalSiteSidebarMenu( {
	shouldShowAddOns,
	showSiteMonitoring,
	siteDomain,
	selectedSiteSlug,
}: {
	shouldShowAddOns: boolean;
	showSiteMonitoring: boolean;
	siteDomain: string;
	selectedSiteSlug: string;
} ) {
	return [
		{
			icon: 'dashicons-arrow-left-alt2',
			slug: 'all-sites',
			title: translate( 'All sites' ),
			type: 'menu-item',
			url: `/sites`,
			className: 'sidebar__menu-item-all-sites',
		},
		{
			type: 'current-site',
			url: `/home/${ siteDomain }`,
		},
		{
			slug: 'wp-admin',
			title: translate( 'WP Admin' ),
			type: 'menu-item',
			url: `https://${ selectedSiteSlug }/wp-admin`,
			className: 'sidebar__menu-item-wp-admin',
			forceShowExternalIcon: true,
		},
		{
			type: 'separator',
		},
		{
			slug: 'upgrades',
			title: translate( 'Plans' ),
			type: 'menu-item',
			url: `/plans/${ siteDomain }`,
		},
		...( shouldShowAddOns
			? [
					{
						slug: 'Add-Ons',
						title: translate( 'Add-Ons' ),
						type: 'menu-item',
						url: `/add-ons/${ siteDomain }`,
					},
			  ]
			: [] ),
		{
			slug: 'domains',
			title: translate( 'Domains' ),
			navigationLabel: translate( 'Manage all domains' ),
			type: 'menu-item',
			url: `/domains/manage/${ siteDomain }`,
		},
		{
			slug: 'Emails',
			title: translate( 'Emails' ),
			type: 'menu-item',
			url: `/email/${ siteDomain }`,
		},
		{
			slug: 'Purchases',
			title: translate( 'Purchases' ),
			type: 'menu-item',
			url: `/purchases/subscriptions/${ siteDomain }`,
		},
		{
			slug: 'options-hosting-configuration-php',
			title: translate( 'Hosting' ),
			type: 'menu-item',
			url: `/hosting-config/${ siteDomain }`,
		},
		...( showSiteMonitoring
			? [
					{
						slug: 'tools-site-monitoring',
						title: translate( 'Monitoring' ),
						type: 'menu-item',
						url: `/site-monitoring/${ siteDomain }`,
					},
			  ]
			: [] ),
		{
			slug: 'tools-earn',
			title: translate( 'Monetize' ),
			type: 'menu-item',
			url: `/earn/${ siteDomain }`,
		},
		{
			slug: 'options-podcasting-php',
			title: translate( 'Podcasting' ),
			type: 'menu-item',
			url: `/settings/podcasting/${ siteDomain }`,
		},
		{
			slug: 'subscribers',
			title: translate( 'Subscribers' ),
			type: 'menu-item',
			url: `/subscribers/${ siteDomain }`,
		},
		{
			slug: 'settings-site',
			title: translate( 'Settings' ),
			type: 'menu-item',
			url: `/settings/general/${ siteDomain }`,
		},
	];
}
