/**
 * Internal dependencies
 */
import { PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_ECOMMERCE } from './constants';
import type { PlanAction } from './actions';
import type { PlanSlug } from './types';
import { PLANS_LIST } from './plans-data';

type PricesMap = {
	[ slug in PlanSlug ]: string;
};

export const supportedPlanSlugs = Object.keys( PLANS_LIST );

const DEFAUlT_STATE: {
	supportedPlanSlugs: PlanSlug[];
	prices: PricesMap;
} = {
	supportedPlanSlugs,
	prices: {
		[ PLAN_FREE ]: '',
		[ PLAN_PERSONAL ]: '',
		[ PLAN_PREMIUM ]: '',
		[ PLAN_BUSINESS ]: '',
		[ PLAN_ECOMMERCE ]: '',
	},
};

const reducer = function ( state = DEFAUlT_STATE, action: PlanAction ) {
	switch ( action.type ) {
		case 'SET_PRICES':
			return {
				...state,
				prices: action.prices,
			};
		default:
			return state;
	}
};

export type State = typeof DEFAUlT_STATE;

export default reducer;
