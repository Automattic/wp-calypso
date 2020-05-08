/**
 * External dependencies
 */
import * as plans from '../../../../lib/plans/constants';

/**
 * Internal dependencies
 */
import { freePlan } from './constants';
import type { PlanAction } from './actions';

export const supportedPlanSlugs = [
	plans.PLAN_FREE,
	plans.PLAN_PERSONAL,
	plans.PLAN_PREMIUM,
	plans.PLAN_BUSINESS,
	plans.PLAN_ECOMMERCE,
];

const DEFAUlT_STATE: {
	selectedPlanSlug: string | undefined;
	supportedPlanSlugs: Array< string >;
} = {
	supportedPlanSlugs,
	selectedPlanSlug: undefined,
};

const reducer = function ( state = DEFAUlT_STATE, action: PlanAction ) {
	switch ( action.type ) {
		case 'SET_PLAN':
			return {
				...state,
				selectedPlanSlug: action.slug !== freePlan ? action.slug : DEFAUlT_STATE.selectedPlanSlug,
			};
		case 'RESET_PLAN':
			return DEFAUlT_STATE;
		default:
			return state;
	}
};

export type State = ReturnType< typeof reducer >;

export default reducer;
