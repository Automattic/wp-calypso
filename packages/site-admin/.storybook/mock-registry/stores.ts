/**
 * External dependencies
 */
import { createRegistry } from '@wordpress/data';
import { store as coreDataStore } from '@wordpress/core-data';
import { store as commandsStore } from '@wordpress/commands';

type WPDataRegistry = ReturnType< typeof createRegistry >;

const WOOCOMMERCE_ANALYTICS_SITE_KEY = 'Woocommerce Analytics' as const;
const REGULAR_SITE_KEY = 'Regular Site' as const;
const JETPACK_SITE_KEY = 'Jetpack Site' as const;

export type MockSiteKey =
	| typeof WOOCOMMERCE_ANALYTICS_SITE_KEY
	| typeof REGULAR_SITE_KEY
	| typeof JETPACK_SITE_KEY;

export type MockStores = Record< MockSiteKey, Record< string, WPDataRegistry > >;

const image_url_01 = 'https://i.pravatar.cc/300';
const image_url_02 = 'https://i.pravatar.cc/301';

const mockStores = {
	[ WOOCOMMERCE_ANALYTICS_SITE_KEY ]: {
		[ coreDataStore.name ]: {
			name: 'WooCommerce Analytics',
			description:
				'WooCommerce Analytics is a powerful tool that helps you understand how your store is performing and how you can improve your store’s performance.',
			'root/__unstableBase': { site_icon_url: image_url_01 },
			'root/site': { title: 'WooCommerce Analytics Site', url: 'https://woocommerce.com' },
		},
		[ commandsStore.name ]: {},
	},
	[ REGULAR_SITE_KEY ]: {
		[ coreDataStore.name ]: {
			name: 'Regular Site',
			description: 'A regular site with no special features.',
			'root/__unstableBase': { site_icon_url: undefined },
			'root/site': { title: 'My Regular Site', url: 'https://example.com' },
		},
		[ commandsStore.name ]: {},
	},
	[ JETPACK_SITE_KEY ]: {
		[ coreDataStore.name ]: {
			name: 'Jetpack Site',
			description: 'A site with Jetpack installed.',
			'root/__unstableBase': { site_icon_url: image_url_02 },
			'root/site': { title: 'Jetpack Super Site', url: 'https://jetpack.com' },
		},
		[ commandsStore.name ]: {},
	},
};

export default mockStores;
