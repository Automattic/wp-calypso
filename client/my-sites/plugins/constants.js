import {
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
		product: PRODUCT_JETPACK_SEARCH_MONTHLY,
	},
};
