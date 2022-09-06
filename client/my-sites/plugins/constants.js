import {
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	WPCOM_FEATURES_INSTANT_SEARCH,
} from '@automattic/calypso-products';

export const PREINSTALLED_PLUGINS = [
	'jetpack',
	'akismet',
	'vaultpress',
	'gutenberg',
	'full-site-editing',
	'layout-grid',
	'page-optimize',
];

export const PREINSTALLED_PREMIUM_PLUGINS = {
	'jetpack-search': {
		feature: WPCOM_FEATURES_INSTANT_SEARCH,
		jetpack_module: 'search',
		products: {
			monthly: PRODUCT_JETPACK_SEARCH_MONTHLY,
			yearly: PRODUCT_JETPACK_SEARCH,
		},
	},
};

export const AUTOMOMANAGED_PLUGINS_ECOM = [ 'woocommerce' ];
