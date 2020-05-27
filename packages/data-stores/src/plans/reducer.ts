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
	selectedPlanSlug?: PlanSlug;
	prices: PricesMap;
} = {
	supportedPlanSlugs,
	selectedPlanSlug: undefined,
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
		case 'SET_PLAN':
			return {
				...state,
				selectedPlanSlug: action.slug,
			};
		case 'SET_PRICES':
			return {
				...state,
				prices: action.prices,
			};
		case 'RESET_PLAN':
			return DEFAUlT_STATE;
		default:
			return state;
	}
};

export type State = typeof DEFAUlT_STATE;

export default reducer;
