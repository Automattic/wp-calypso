/**
 * External dependencies
 */
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import type { State } from './reducer';
import {
	DEFAULT_ANNUAL_PAID_PLAN,
	PLAN_ECOMMERCE,
	PLAN_FREE,
	STORE_KEY,
	PlanPath,
	PLAN_ECOMMERCE_MONTHLY,
	DEFAULT_MONTHLY_PAID_PLAN,
	billedMonthlySlugs,
	billedYearlySlugs,
} from './constants';
import type { Plan, PlanFeature, FeaturesByType, PlanSlug } from './types';

// Some of these selectors require unused parameters because those
// params are used by the associated resolver.
/* eslint-disable @typescript-eslint/no-unused-vars */

export const getFeatures = ( state: State ): Record< string, PlanFeature > => state.features;

export const getFeaturesByType = ( state: State ): Array< FeaturesByType > => state.featuresByType;

export const getPlanBySlug = ( state: State, slug: PlanSlug ): Plan => {
	return state.plans[ slug ] ?? undefined;
};

export const getDefaultPaidPlan = (
	_: State,
	locale: string,
	billPeriod: Plan[ 'billPeriod' ] = 'ANNUALLY'
): Plan | undefined => {
	const targetSlug =
		billPeriod === 'ANNUALLY' ? DEFAULT_ANNUAL_PAID_PLAN : DEFAULT_MONTHLY_PAID_PLAN;

	return select( STORE_KEY )
		.getSupportedPlans( locale )
		.find( ( plan ) => plan.storeSlug === targetSlug );
};

export const getDefaultFreePlan = ( _: State, locale: string ): Plan | undefined => {
	return select( STORE_KEY )
		.getSupportedPlans( locale )
		.find( ( plan ) => plan.storeSlug === PLAN_FREE );
};

export const getSupportedPlans = (
	state: State,
	_locale?: string,
	billingPeriod?: Plan[ 'billPeriod' ] | undefined
): Plan[] => {
	let supportedPlans: Plan[] = Object.keys( state.plans )
		.map( ( slug ) => state.plans[ slug ] )
		.filter( Boolean );

	if ( billingPeriod ) {
		supportedPlans = supportedPlans.filter( ( plan ) => {
			if ( plan.isFree || billingPeriod === plan.billPeriod ) {
				return true;
			}
			return false;
		} );
	}

	return supportedPlans;
};

export const getPlanByPath = ( state: State, path?: PlanPath ): Plan | undefined => {
	return path ? getSupportedPlans( state ).find( ( plan ) => plan?.pathSlug === path ) : undefined;
};

export const getPlansPaths = ( state: State ): string[] => {
	return getSupportedPlans( state ).map( ( plan ) => plan?.pathSlug );
};

export const isPlanEcommerce = ( _: State, planSlug?: PlanSlug ): boolean => {
	return planSlug === PLAN_ECOMMERCE || planSlug === PLAN_ECOMMERCE_MONTHLY;
};

export const isPlanFree = ( _: State, planSlug?: PlanSlug ): boolean => {
	return planSlug === PLAN_FREE;
};

export const getCorrespondingPlanFromOtherInterval = (
	state: State,
	plan: Plan | undefined
): Plan | undefined => {
	if ( ! plan ) {
		return undefined;
	}
	if ( plan.isFree ) {
		return plan;
	}
	if ( plan.billPeriod === 'ANNUALLY' ) {
		const index = billedYearlySlugs.indexOf( plan.storeSlug as never );
		return getPlanBySlug( state, billedMonthlySlugs[ index ] );
	}
	const index = billedMonthlySlugs.indexOf( plan.storeSlug as never );
	return getPlanBySlug( state, billedYearlySlugs[ index ] );
};
