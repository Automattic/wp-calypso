/**
 * Internal dependencies
 */
import { shouldShowOfferResetFlow } from 'lib/abtest/getters';
import { JETPACK_RESET_PLANS } from 'lib/plans/constants';
import { JETPACK_PRODUCTS_LIST } from 'lib/products-values/constants';
import { UPSELL_PRODUCT_MATRIX } from 'my-sites/plans-v2/constants';

export const IS_DOT_COM_GET_SEARCH = 'isDotComGetSearch';
export const JETPACK_MINIMUM_WORDPRESS_VERSION = '4.7';
export const JPC_PATH_PLANS = '/jetpack/connect/plans';
export const JPC_PATH_REMOTE_INSTALL = '/jetpack/connect/install';
export const MINIMUM_JETPACK_VERSION = '3.9.6';
export const REMOTE_PATH_ACTIVATE = '/wp-admin/plugins.php';
export const REMOTE_PATH_AUTH =
	'/wp-admin/admin.php?page=jetpack&connect_url_redirect=true&jetpack_connect_login_redirect=true';
export const REMOTE_PATH_INSTALL =
	'/wp-admin/plugin-install.php?tab=plugin-information&plugin=jetpack';
export const ALLOWED_MOBILE_APP_REDIRECT_URL_LIST = [ /^wordpress:\/\// ];
export const JPC_PATH_CHECKOUT = '/checkout';

// Offer Reset allows users to purchase two products at the same time. The allowed
// combinations are stored in `OFFER_RESET_COMBINED_FLOW_TYPES`. From this matrix,
// we get a list of strings that follow the `productSlug1,productSlug2` pattern.
export const OFFER_RESET_COMBINED_FLOW_TYPES = shouldShowOfferResetFlow()
	? Object.entries( UPSELL_PRODUCT_MATRIX ).map( ( fromTo ) => fromTo.join( ',' ) )
	: [];

// Since Offer Reset relies in this flow, we need to make sure we are supporting
// all types that are part of Offer Reset.
export const OFFER_RESET_FLOW_TYPES = shouldShowOfferResetFlow()
	? [ ...JETPACK_RESET_PLANS, ...JETPACK_PRODUCTS_LIST, ...OFFER_RESET_COMBINED_FLOW_TYPES ]
	: [];

export const FLOW_TYPES = [
	...new Set( [
		'install',
		'personal',
		'premium',
		'pro',
		'jetpack_search',
		'backup',
		'realtimebackup',
		'scan',
		'antispam',
		...OFFER_RESET_FLOW_TYPES,
	] ),
];
