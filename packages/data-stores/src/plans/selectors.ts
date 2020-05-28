/**
 * Internal dependencies
 */
import { State } from './reducer';
import { planDetails, PLANS_LIST } from './plans-data';
import { DEFAULT_PAID_PLAN, PLAN_FREE, PLAN_ECOMMERCE } from './constants';
import type { PlanSlug } from './types';

function getPlan( slug?: PlanSlug ) {
	if ( slug ) {
		return PLANS_LIST[ slug ];
	}
	return null;
}

export const getSelectedPlan = ( state: State ) => getPlan( state.selectedPlanSlug );

export const getDefaultPlan = ( _: State, hasPaidDomain: boolean, hasPaidDesign: boolean ) =>
	hasPaidDomain || hasPaidDesign ? getPlan( DEFAULT_PAID_PLAN ) : getPlan( PLAN_FREE );

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
