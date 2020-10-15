/**
 * Internal dependencies
 */
import type { State } from './reducer';
import { planDetails, PLANS_LIST } from './plans-data';
import { DEFAULT_PAID_PLAN, PLAN_ECOMMERCE, PLAN_FREE } from './constants';
import type { Plan, PlanSlug } from './types';

function getPlan( state: State, slug: PlanSlug ): Plan | undefined {
	const apiPlan = state?.plans.find( ( plan ) => plan.product_slug === slug );
	if ( ! apiPlan ) {
		return undefined;
	}

	const { product_name_short: title, product_id: productId, path_slug: pathSlug } = apiPlan;
	const { description, features, isPopular } = PLANS_LIST[ slug ];

	return {
		title,
		description,
		productId,
		storeSlug: apiPlan.product_slug,
		pathSlug,
		features,
		isPopular,
		isFree: apiPlan.raw_price === 0,
	};
}

export const getPlanBySlug = ( state: State, slug: PlanSlug ) => getPlan( state, slug );

export const getDefaultPaidPlan = ( state: State ) => getPlan( state, DEFAULT_PAID_PLAN );

export const getSupportedPlans = ( state: State ) =>
	state.supportedPlanSlugs.map( ( slug ) => getPlan( state, slug ) ).filter( isDefined );

function isDefined< T >( t: T | undefined ): t is T {
	return t !== undefined;
}

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

export const __internalGetPlans = ( state: State ) => state.plans;
