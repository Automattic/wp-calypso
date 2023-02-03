import { select } from '@wordpress/data';
import deprecate from '@wordpress/deprecated';
import {
	DEFAULT_PAID_PLAN,
	TIMELESS_PLAN_ECOMMERCE,
	TIMELESS_PLAN_FREE,
	STORE_KEY,
	FREE_PLAN_PRODUCT_ID,
} from './constants';
import type { State } from './reducer';
import type {
	Plan,
	PlanFeature,
	FeaturesByType,
	PlanProduct,
	PlanPath,
	PlanSlug,
	StorePlanSlug,
} from './types';

// Some of these selectors require unused parameters because those
// params are used by the associated resolver.
/* eslint-disable @typescript-eslint/no-unused-vars */

export const getFeatures = ( state: State, locale: string ): Record< string, PlanFeature > =>
	state.features[ locale ] ?? {};

export const getFeaturesByType = ( state: State, locale: string ): Array< FeaturesByType > =>
	state.featuresByType[ locale ] ?? [];

export const getPlanByProductId = (
	_state: State,
	productId: number | undefined,
	locale: string
): Plan | undefined => {
	if ( ! productId ) {
		return undefined;
	}

	return select( STORE_KEY )
		.getSupportedPlans( locale )
		.find( ( plan ) => plan.productIds.indexOf( productId ) > -1 );
};

export const getPlanProductById = (
	_state: State,
	productId: number | undefined
): PlanProduct | undefined => {
	if ( ! productId ) {
		return undefined;
	}

	return select( STORE_KEY )
		.getPlansProducts()
		.find( ( product ) => product.productId === productId );
};

export const getPlanByPeriodAgnosticSlug = (
	_state: State,
	slug: PlanSlug | undefined,
	locale: string
): Plan | undefined => {
	if ( ! slug ) {
		return undefined;
	}
	return select( STORE_KEY )
		.getSupportedPlans( locale )
		.find( ( plan ) => plan.periodAgnosticSlug === slug );
};

export const getDefaultPaidPlan = ( _: State, locale: string ): Plan | undefined => {
	return select( STORE_KEY )
		.getSupportedPlans( locale )
		.find( ( plan ) => plan.periodAgnosticSlug === DEFAULT_PAID_PLAN );
};

export const getDefaultFreePlan = ( _: State, locale: string ): Plan | undefined => {
	return select( STORE_KEY )
		.getSupportedPlans( locale )
		.find( ( plan ) => plan.periodAgnosticSlug === TIMELESS_PLAN_FREE );
};

export const getSupportedPlans = ( state: State, _locale: string ): Plan[] => {
	return state.plans[ _locale ] ?? [];
};

export const getPlansProducts = ( state: State ): PlanProduct[] => {
	return state.planProducts;
};

/**
 * @deprecated  getPrices is deprecated, please use plan.price directly
 * @param _state the state
 * @param _locale the locale
 */
export const getPrices = ( _state: State, _locale: string ): Record< StorePlanSlug, string > => {
	deprecate( 'getPrices', {
		alternative: 'getPlanProduct().price',
	} );
	return select( STORE_KEY )
		.getPlansProducts()
		.reduce( ( prices, plan ) => {
			prices[ plan.storeSlug ] = plan.price;
			return prices;
		}, {} as Record< StorePlanSlug, string > );
};

export const getPlanByPath = (
	_state: State,
	path: PlanPath | undefined,
	locale: string
): Plan | undefined => {
	if ( ! path ) {
		return undefined;
	}

	const planProduct = select( STORE_KEY )
		.getPlansProducts()
		.find( ( product ) => product.pathSlug === path );

	if ( ! planProduct ) {
		return undefined;
	}

	return select( STORE_KEY )
		.getSupportedPlans( locale )
		.find( ( plan ) => plan.periodAgnosticSlug === planProduct.periodAgnosticSlug );
};

export const getPlanProduct = (
	_state: State,
	periodAgnosticSlug: string | undefined,
	billingPeriod: PlanProduct[ 'billingPeriod' ] | undefined
): PlanProduct | undefined => {
	if ( ! periodAgnosticSlug || ! billingPeriod ) {
		return undefined;
	}

	return select( STORE_KEY )
		.getPlansProducts()
		.find( ( product ) => {
			const matchesSlug = product.periodAgnosticSlug === periodAgnosticSlug;
			// The billing period doesn't matter when dealing with free plan
			const matchesBillingPeriod =
				periodAgnosticSlug === TIMELESS_PLAN_FREE || product.billingPeriod === billingPeriod;

			return matchesSlug && matchesBillingPeriod;
		} );
};

export const isPlanEcommerce = ( _: State, planSlug?: PlanSlug ): boolean => {
	return planSlug === TIMELESS_PLAN_ECOMMERCE;
};

export const isPlanFree = ( _: State, planSlug?: PlanSlug ): boolean => {
	return planSlug === TIMELESS_PLAN_FREE;
};

export const isPlanProductFree = ( _: State, planProductId: number | undefined ): boolean =>
	planProductId === FREE_PLAN_PRODUCT_ID;
