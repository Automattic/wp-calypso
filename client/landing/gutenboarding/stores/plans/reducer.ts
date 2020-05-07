/**
 * Internal dependencies
 */
import * as plans from '../../../../lib/plans/constants';

export const supportedPlanSlugs = [
	plans.PLAN_FREE,
	plans.PLAN_PERSONAL,
	plans.PLAN_PREMIUM,
	plans.PLAN_BUSINESS,
	plans.PLAN_ECOMMERCE,
];

import { PlanAction } from './types';

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
			return { ...state, selectedPlanSlug: action.slug };
		default:
			return state;
	}
};

export type State = ReturnType< typeof reducer >;

export default reducer;
