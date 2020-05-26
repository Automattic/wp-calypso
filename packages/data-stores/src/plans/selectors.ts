/**
 * Internal dependencies
 */
import { State, supportedPlanSlugs } from './reducer';
import { planFeatures, planDetails, PLANS_LIST } from './plans-data';
import { DEFAULT_PAID_PLAN, PLAN_FREE } from './constants';
import type { PlanSlug } from './types';

function getFortifiedPlan( slug?: PlanSlug ) {
	if ( ! slug ) {
		return undefined;
	}
	return { ...planFeatures[ slug ], ...PLANS_LIST[ slug ] };
}

export const getSelectedPlan = ( state: State ) => getFortifiedPlan( state.selectedPlanSlug );

export const getDefaultPlan = ( _: State, hasPaidDomain: boolean, hasPaidDesign: boolean ) =>
	hasPaidDomain || hasPaidDesign
		? getFortifiedPlan( DEFAULT_PAID_PLAN )
		: getFortifiedPlan( PLAN_FREE );

export const getSupportedPlans = ( state: State ) =>
	state.supportedPlanSlugs.map( getFortifiedPlan );

export const getPlanByPath = ( _: State, path: PlanSlug | undefined ) =>
	getFortifiedPlan( supportedPlanSlugs.find( ( slug ) => PLANS_LIST[ slug ].pathSlug === path ) );

export const getPlansDetails = () => planDetails;

export const getPlansPaths = ( state: State ) =>
	getSupportedPlans( state ).map( ( plan ) => plan?.pathSlug );

export const getPrices = ( state: State ) => state.prices;
