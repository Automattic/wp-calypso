/**
 * External dependencies
 */
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import type { State, PricesMap } from './reducer';
import { DEFAULT_PAID_PLAN, PLAN_ECOMMERCE, PLAN_FREE, STORE_KEY, PlanPath } from './constants';
import type { Plan, PlanFeature, PlanFeatureType, PlanSlug } from './types';

// Some of these selectors require unused parameters because those
// params are used by the associated resolver.
/* eslint-disable @typescript-eslint/no-unused-vars */

export const getFeatures = ( state: State ): Record< string, PlanFeature > => state.features;

export const getFeaturesByType = ( state: State ): Array< PlanFeatureType > => state.featuresByType;

export const getPlanBySlug = ( state: State, slug: PlanSlug ): Plan => {
	return state.plans[ slug ] ?? undefined;
};

export const getDefaultPaidPlan = ( _: State, locale: string ): Plan => {
	return select( STORE_KEY ).getPlansDetails( locale )?.plans[ DEFAULT_PAID_PLAN ];
};

export const getDefaultFreePlan = ( _: State, locale: string ): Plan => {
	return select( STORE_KEY ).getPlansDetails( locale )?.plans[ PLAN_FREE ];
};

export const getSupportedPlans = ( state: State ): Plan[] => {
	const supportedPlans: Plan[] = [];

	state.supportedPlanSlugs.forEach( ( slug ) => {
		if ( slug in state.plans ) {
			supportedPlans.push( state.plans[ slug ] );
		}
	} );

	return supportedPlans;
};

export const getPlanByPath = ( state: State, path?: PlanPath ): Plan | undefined => {
	return path ? getSupportedPlans( state ).find( ( plan ) => plan?.pathSlug === path ) : undefined;
};

export const getPlansDetails = ( state: State, _: string ): State => state;

export const getPlansPaths = ( state: State ): string[] => {
	return getSupportedPlans( state ).map( ( plan ) => plan?.pathSlug );
};

export const getPrices = ( state: State, _: string ): PricesMap => state.prices;

export const isPlanEcommerce = ( _: State, planSlug?: PlanSlug ): boolean => {
	return planSlug === PLAN_ECOMMERCE;
};

export const isPlanFree = ( _: State, planSlug?: PlanSlug ): boolean => {
	return planSlug === PLAN_FREE;
};
