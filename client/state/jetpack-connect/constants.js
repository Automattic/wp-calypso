/**
 * Internal dependencies
 */
import { shouldShowOfferResetFlow } from 'lib/abtest/getters';
import { JETPACK_RESET_PLANS } from 'lib/plans/constants';
import { JETPACK_PRODUCTS_LIST } from 'lib/products-values/constants';

export const JETPACK_CONNECT_TTL = 60 * 60 * 1000; // 1 hour
export const JETPACK_CONNECT_TTL_SECONDS = JETPACK_CONNECT_TTL / 60;
export const JETPACK_CONNECT_AUTHORIZE_TTL = 60 * 60 * 1000; // 1 hour
export const AUTH_ATTEMPS_TTL = 60 * 1000; // 1 minute

// Since Offer Reset relies in this flow, we need to make sure we are supporting
// all types that are part of Offer Reset.
export const OFFER_RESET_FLOW_TYPES = shouldShowOfferResetFlow()
	? [ ...JETPACK_RESET_PLANS, ...JETPACK_PRODUCTS_LIST ]
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
