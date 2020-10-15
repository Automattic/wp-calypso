/**
 * Internal dependencies
 */
import type { State } from './reducer';
import { PLANS_LIST } from './plans-data';
import { DEFAULT_PAID_PLAN, PLAN_ECOMMERCE, PLAN_FREE } from './constants';
import type { Plan, PlanSlug } from './types';

function getPlan( slug: PlanSlug ) {
	return PLANS_LIST[ slug ];
}

export const getPlanBySlug = ( _: State, slug: PlanSlug ): Plan => getPlan( slug );

export const getDefaultPaidPlan = (): Plan => getPlan( DEFAULT_PAID_PLAN );

export const getSupportedPlans = ( state: State ): Plan[] => {
	return state.supportedPlanSlugs.map( getPlan );
};

export const getPlanByPath = ( state: State, path?: string ): Plan | undefined => {
	return path ? getSupportedPlans( state ).find( ( plan ) => plan?.pathSlug === path ) : undefined;
};

export const getPlansDetails = ( state: State, locale = 'en' ) => state.plansDetails;

export const getPlansPaths = ( state: State ) => {
	return getSupportedPlans( state ).map( ( plan ) => plan?.pathSlug );
};

export const getPrices = ( state: State ) => state.prices;

export const isPlanEcommerce = ( _: State, planSlug?: PlanSlug ) => {
	return planSlug === PLAN_ECOMMERCE;
};

export const isPlanFree = ( _: State, planSlug?: PlanSlug ) => {
	return planSlug === PLAN_FREE;
};
