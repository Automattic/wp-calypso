/**
 * Internal dependencies
 */
import type { State } from './reducer';
import { DEFAULT_PAID_PLAN, PLAN_ECOMMERCE, PLAN_FREE } from './constants';
import type { Plan, PlanFeature, PlanFeatureType, PlanSlug } from './types';

export const getFeatures = ( state: State ): Record< string, PlanFeature > => state.features;

export const getFeaturesByType = ( state: State ): Array< PlanFeatureType > => state.featuresByType;

export const getPlanBySlug = ( state: State, slug: PlanSlug ): Plan => {
	return state.plans[ slug ] ?? undefined;
};

export const getDefaultPaidPlan = ( state: State ): Plan => {
	return state.plans[ DEFAULT_PAID_PLAN ] ?? undefined;
};

export const getSupportedPlans = ( state: State ): Plan[] => {
	const supportedPlans: Plan[] = [];

	console.log( state );

	state.supportedPlanSlugs.forEach( ( slug ) => {
		if ( slug in state.plans ) {
			supportedPlans.push( state.plans[ slug ] );
		}
	} );

	return supportedPlans;

	// return state.supportedPlanSlugs.map( ( slug ) => state.plans[ slug ] ?? undefined );
};

export const getPlanByPath = ( state: State, path?: string ): Plan | undefined => {
	return path ? getSupportedPlans( state ).find( ( plan ) => plan?.pathSlug === path ) : undefined;
};

export const getPlansDetails = ( state: State, _: any ): State => state;

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
