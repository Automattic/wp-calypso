/**
 * Internal dependencies
 */
import { shouldShowOfferResetFlow } from 'lib/abtest/getters';
import { JETPACK_RESET_PLANS } from 'lib/plans/constants';
import { JETPACK_PRODUCTS_LIST } from 'lib/products-values/constants';
import { UPSELL_PRODUCT_MATRIX } from 'my-sites/plans-v2/constants';
export const JETPACK_CONNECT_TTL = 60 * 60 * 1000; // 1 hour
export const JETPACK_CONNECT_TTL_SECONDS = JETPACK_CONNECT_TTL / 60;
export const JETPACK_CONNECT_AUTHORIZE_TTL = 60 * 60 * 1000; // 1 hour
export const AUTH_ATTEMPS_TTL = 60 * 1000; // 1 minute

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
