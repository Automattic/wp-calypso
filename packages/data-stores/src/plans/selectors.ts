/**
 * Internal dependencies
 */
import type { State } from './reducer';
import { planDetails, PLANS_LIST } from './plans-data';
import { DEFAULT_PAID_PLAN, PLAN_ECOMMERCE, PLAN_FREE } from './constants';
import type { PlanSlug } from './types';

function getPlan( slug: PlanSlug ) {
	return PLANS_LIST[ slug ];
}

export const getPlanBySlug = ( _: State, slug: PlanSlug ) => getPlan( slug );

export const getDefaultPaidPlan = () => getPlan( DEFAULT_PAID_PLAN );

export const getSupportedPlans = ( state: State ) => state.supportedPlanSlugs.map( getPlan );

export const getPlanByPath = ( state: State, path?: string ) =>
	path && getSupportedPlans( state ).find( ( plan ) => plan?.pathSlug === path );

export const getPlansDetails = () => planDetails;

export const getPlansPaths = ( state: State ) =>
	getSupportedPlans( state ).map( ( plan ) => plan?.pathSlug );

export const getPrices = ( state: State ) => state.prices;

export const isPlanEcommerce = ( _: State, planSlug?: PlanSlug ) => {
	return planSlug === PLAN_ECOMMERCE;
};

export const isPlanFree = ( _: State, planSlug?: PlanSlug ) => {
	return planSlug === PLAN_FREE;
};
