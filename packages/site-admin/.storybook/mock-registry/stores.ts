/**
 * External dependencies
 */
import { store as coreDataStore } from '@wordpress/core-data';

const stores = {
	'woocommerce-analytics': {
		[ coreDataStore.name ]: {
			'root/__unstableBase': { site_icon_url: './woo-logo.png' },
		},
	},
	'regular-site': {
		[ coreDataStore.name ]: {
			'root/__unstableBase': { site_icon_url: undefined },
		},
	},
	'jetpack-site': {
		[ coreDataStore.name ]: {
			'root/__unstableBase': { site_icon_url: './jetpack-favicon-2018.png' },
		},
	},
};

export default stores;
