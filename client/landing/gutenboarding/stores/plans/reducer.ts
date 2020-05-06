/**
 * Internal dependencies
 */
import * as plans from '../../../../lib/plans/constants';
import { getPlan } from '../../../../lib/plans';

const supportedPlanSlugs = [
	plans.PLAN_FREE,
	plans.PLAN_PERSONAL,
	plans.PLAN_PREMIUM,
	plans.PLAN_BUSINESS,
	plans.PLAN_ECOMMERCE,
];

const supportedPlans = supportedPlanSlugs.map( getPlan );

import { Plan, PlanAction } from './types';

const DEFAUlT_STATE: { selectedPlan: Plan; supportedPlans: Array< Plan > } = {
	supportedPlans,
	selectedPlan: getPlan( supportedPlanSlugs[ 0 ] ),
};

const reducer = function ( state = DEFAUlT_STATE, action: PlanAction ) {
	switch ( action.type ) {
		case 'SET_PLAN':
			return { ...state, selectedPlan: action.plan };
		default:
			return state;
	}
};

export type State = ReturnType< typeof reducer >;

export default reducer;
