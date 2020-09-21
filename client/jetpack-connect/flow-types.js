/**
 * Internal dependencies
 */
import { shouldShowOfferResetFlow } from 'lib/plans/config';
import { JETPACK_RESET_PLANS } from 'lib/plans/constants';
import { JETPACK_PRODUCTS_LIST } from 'lib/products-values/constants';
import { UPSELL_PRODUCT_MATRIX } from 'my-sites/plans-v2/constants';

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
