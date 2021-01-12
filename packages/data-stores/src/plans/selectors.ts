/**
 * External dependencies
 */
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import type { State, PricesMap, DiscountsMap } from './reducer';
import {
	DEFAULT_PAID_PLAN,
	PLAN_ECOMMERCE,
	PLAN_FREE,
	STORE_KEY,
	PlanPath,
	PLAN_ECOMMERCE_MONTHLY,
	billedMonthlySlugs,
	billedYearlySlugs,
} from './constants';
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
	const supportedPlans: Plan[] = state.supportedPlanSlugs
		.map( ( slug ) => state.plans[ slug ] )
		.filter( Boolean );

	return supportedPlans;
};

export const getPeriodSupportedPlans = (
	state: State,
	billingPeriod: 'ANNUALLY' | 'MONTHLY' = 'ANNUALLY'
): Plan[] => {
	const supportedPlans: Plan[] = getSupportedPlans( state ).filter( ( plan ) => {
		if ( plan.isFree ) {
			return true;
		} else if ( billingPeriod === 'MONTHLY' ) {
			return billedMonthlySlugs.indexOf( plan.storeSlug as never ) > -1;
		}
		return billedYearlySlugs.indexOf( plan.storeSlug as never ) > -1;
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

export const getDiscounts = ( state: State ): DiscountsMap => state.discounts;

export const isPlanEcommerce = ( _: State, planSlug?: PlanSlug ): boolean => {
	return planSlug === PLAN_ECOMMERCE || planSlug === PLAN_ECOMMERCE_MONTHLY;
};

export const isPlanFree = ( _: State, planSlug?: PlanSlug ): boolean => {
	return planSlug === PLAN_FREE;
};
