/**
 * Internal dependencies
 */
import { PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_ECOMMERCE } from './constants';
import type { PlanAction } from './actions';

export const supportedPlanSlugs = [
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
];

const DEFAUlT_STATE: {
	selectedPlanSlug: string | undefined;
	supportedPlanSlugs: Array< string >;
	prices: Record< string, string >;
} = {
	supportedPlanSlugs,
	selectedPlanSlug: undefined,
	prices: {},
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

export type State = ReturnType< typeof reducer >;

export default reducer;
