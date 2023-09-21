import { translate } from 'i18n-calypso';

const domainOnlyFallbackMenu = ( { siteDomain }: { siteDomain: string } ) => {
	return [
		{
			icon: 'dashicons-admin-settings',
			slug: 'manage-domain',
			title: translate( 'Manage Domain' ),
			type: 'menu-item',
			url: `/domains/manage/${ siteDomain }/edit/${ siteDomain }`,
		},
		// Note: A "Manage Email" item will also be surfaced from the backend when the user has email subscriptions
		{
			icon: 'dashicons-cart',
			slug: 'manage-purchases',
			title: translate( 'Manage Purchases' ),
			type: 'menu-item',
			url: `/purchases/subscriptions/${ siteDomain }`,
		},
		{
			icon: 'dashicons-email',
			slug: 'mailboxes',
			title: translate( 'My Mailboxes' ),
			type: 'menu-item',
			url: `/mailboxes/${ siteDomain }`,
		},
	];
};

export default domainOnlyFallbackMenu;
