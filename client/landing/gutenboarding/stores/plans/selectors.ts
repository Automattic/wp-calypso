/**
 * Internal dependencies
 */
import { State } from './reducer';
import { DEFAULT_FREE_PLAN, DEFAULT_PAID_PLAN, paths } from './constants';

export const getDefaultPlan = ( state: State, hasPaidDomain: boolean ) => {
	if ( Object.keys( state.supportedPlans ).length ) {
		const defaultFreePlan = state.supportedPlans[ DEFAULT_FREE_PLAN ];
		const defaultPaidPlan = state.supportedPlans[ DEFAULT_PAID_PLAN ];
		return hasPaidDomain ? defaultPaidPlan : defaultFreePlan;
	}
};

export const getSupportedPlans = ( state: State ) => state.supportedPlans;
export const getAllFeatures = ( state: State ) => state.features;
export const getPrices = ( state: State ) => state.prices;
export const getPlan = ( state: State, slug: string ) => getSupportedPlans( state )[ slug ];
export const getSelectedPlan = ( state: State ) =>
	state.selectedPlanSlug && getPlan( state, state.selectedPlanSlug );

export const getPlanByPath = ( state: State, path: keyof typeof paths | undefined ) => {
	if ( path ) {
		const slug = paths[ path ];
		return getPlan( state, slug );
	}
};
