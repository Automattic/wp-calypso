/**
 * External dependencies
 */
import { store as coreDataStore } from '@wordpress/core-data';

const stores = {
	'woocommerce-analytics': {
		[ coreDataStore.name ]: {
			name: 'WooCommerce Analytics',
			description:
				'WooCommerce Analytics is a powerful tool that helps you understand how your store is performing and how you can improve your store’s performance.',
			'root/__unstableBase': { site_icon_url: './woo-logo.png' },
		},
	},
	'regular-site': {
		[ coreDataStore.name ]: {
			name: 'Regular Site',
			description: 'A regular site with no special features.',
			'root/__unstableBase': { site_icon_url: undefined },
		},
	},
	'jetpack-site': {
		[ coreDataStore.name ]: {
			name: 'Jetpack Site',
			description: 'A site with Jetpack installed.',
			'root/__unstableBase': { site_icon_url: './jetpack-favicon-2018.png' },
		},
	},
};

export default stores;
