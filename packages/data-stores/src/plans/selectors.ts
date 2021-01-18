/**
 * External dependencies
 */
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import type { State } from './reducer';
import {
	DEFAULT_PAID_PLAN,
	TIMELESS_PLAN_ECOMMERCE,
	TIMELESS_PLAN_FREE,
	STORE_KEY,
} from './constants';
import deprecate from '@wordpress/deprecated';
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

export const getFeatures = ( state: State ): Record< string, PlanFeature > => state.features;

export const getFeaturesByType = ( state: State ): Array< FeaturesByType > => state.featuresByType;

export const getPlanByProductId = (
	_state: State,
	productId: number | undefined
): Plan | undefined => {
	if ( ! productId ) {
		return undefined;
	}

	return select( STORE_KEY )
		.getSupportedPlans()
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
	slug: PlanSlug | undefined
): Plan | undefined => {
	if ( ! slug ) {
		return undefined;
	}
	return select( STORE_KEY )
		.getSupportedPlans()
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

export const getSupportedPlans = ( state: State, _locale?: string ): Plan[] => {
	return state.plans;
};

export const getPlansProducts = ( state: State, _locale?: string ): PlanProduct[] => {
	return state.planProducts;
};

/**
 * @deprecated  getPrices is deprecated, please use plan.price directly
 *
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

export const getPlanByPath = ( _state: State, path?: PlanPath ): Plan | undefined => {
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
		.getSupportedPlans()
		.find( ( plan ) => plan.periodAgnosticSlug === planProduct?.periodAgnosticSlug );
};

export const getPlanProduct = (
	_state: State,
	periodAgnosticSlug: string | undefined,
	billingPeriod: PlanProduct[ 'billingPeriod' ] | undefined
): PlanProduct | undefined => {
	if ( ! periodAgnosticSlug || ! billingPeriod ) {
		return undefined;
	}
	const products = select( STORE_KEY ).getPlansProducts();
	if ( periodAgnosticSlug === TIMELESS_PLAN_FREE ) {
		return products.find( ( product ) => product.periodAgnosticSlug === periodAgnosticSlug );
	}
	const planProduct = products.find(
		( product ) =>
			product.billingPeriod === billingPeriod && product.periodAgnosticSlug === periodAgnosticSlug
	);
	return planProduct;
};

export const isPlanEcommerce = ( _: State, planSlug?: PlanSlug ): boolean => {
	return planSlug === TIMELESS_PLAN_ECOMMERCE;
};

export const isPlanFree = ( _: State, planSlug?: PlanSlug ): boolean => {
	return planSlug === TIMELESS_PLAN_FREE;
};

export const isPlanProductFree = ( _: State, planProductId?: number | undefined ): boolean => {
	return planProductId === 1;
};

/*
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
		const index = annualSlugs.indexOf( plan.storeSlug as never );
		return getPlanBySlug( state, monthlySlugs[ index ] );
	}
	const index = monthlySlugs.indexOf( plan.storeSlug as never );
	return getPlanBySlug( state, annualSlugs[ index ] );
};
*/
