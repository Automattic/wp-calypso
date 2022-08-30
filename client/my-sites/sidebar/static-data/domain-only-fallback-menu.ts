import { translate } from 'i18n-calypso';

const domainOnlyFallbackMenu = ( { siteDomain }: { siteDomain: string } ) => {
	return [
		{
			icon: 'dashicons-admin-settings',
			slug: 'manage-domain',
			title: translate( 'Manage domain' ),
			type: 'menu-item',
			url: `/domains/manage/${ siteDomain }/edit/${ siteDomain }`,
		},
		{
			icon: 'dashicons-cart',
			slug: 'manage-purchases',
			title: translate( 'Manage purchases' ),
			type: 'menu-item',
			url: `/purchases/subscriptions/${ siteDomain }`,
		},
		{
			icon: 'dashicons-email',
			slug: 'inbox',
			title: translate( 'Inbox' ),
			type: 'menu-item',
			url: `/inbox/${ siteDomain }`,
		},
	];
};

export default domainOnlyFallbackMenu;
