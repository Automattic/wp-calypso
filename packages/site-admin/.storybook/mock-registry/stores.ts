/**
 * External dependencies
 */
import { store as coreDataStore } from '@wordpress/core-data';

const stores = {
	'woocommerce-analytics': {
		[ coreDataStore.name ]: {
			'root/__unstableBase': { site_icon_url: './Woo_logo_color.png' },
		},
	},
};

export default stores;
