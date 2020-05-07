/**
 * Internal dependencies
 */
import { State, supportedPlanSlugs } from './reducer';
import * as plans from 'lib/plans/constants';
import { getPlan, getPlanPath } from 'lib/plans';

export const freePlan = plans.PLAN_FREE;
export const defaultPaidPlan = plans.PLAN_PREMIUM;

export const getSelectedPlan = ( state: State ) => getPlan( state.selectedPlanSlug );
export const getDefaultPlan = ( state: State, hasPaidDomain: boolean ) =>
	hasPaidDomain ? getPlan( defaultPaidPlan ) : getPlan( freePlan );
export const getSupportedPlans = ( state: State ) => state.supportedPlanSlugs.map( getPlan );
export const getPlanByPath = ( state: State, path: string | undefined ) =>
	getPlan( supportedPlanSlugs.find( ( slug ) => getPlanPath( slug ) === path ) );
