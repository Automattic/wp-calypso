/**
 * Internal dependencies
 */
import type { Plan, PlanFeature, FeaturesByType, PlanProduct } from './types';

type setFeaturesAction = {
	type: 'SET_FEATURES';
	features: Record< string, PlanFeature >;
	locale: string;
};
export const setFeatures = (
	features: Record< string, PlanFeature >,
	locale: string
): setFeaturesAction => ( {
	type: 'SET_FEATURES' as const,
	features,
	locale,
} );

type setFeaturesByTypeAction = {
	type: 'SET_FEATURES_BY_TYPE';
	featuresByType: Array< FeaturesByType >;
	locale: string;
};
export const setFeaturesByType = (
	featuresByType: Array< FeaturesByType >,
	locale: string
): setFeaturesByTypeAction => ( {
	type: 'SET_FEATURES_BY_TYPE' as const,
	featuresByType,
	locale,
} );

type setPlansAction = {
	type: 'SET_PLANS';
	plans: Plan[];
	locale: string;
};
export const setPlans = ( plans: Plan[], locale: string ): setPlansAction => ( {
	type: 'SET_PLANS' as const,
	plans,
	locale,
} );

type setPlanProductsAction = {
	type: 'SET_PLAN_PRODUCTS';
	products: PlanProduct[];
};
export const setPlanProducts = ( products: PlanProduct[] ): setPlanProductsAction => ( {
	type: 'SET_PLAN_PRODUCTS' as const,
	products,
} );

type resetPlanAction = { type: 'RESET_PLAN' };
export const resetPlan = (): resetPlanAction => ( {
	type: 'RESET_PLAN' as const,
} );

export type PlanAction = ReturnType<
	| typeof setFeatures
	| typeof setFeaturesByType
	| typeof setPlans
	| typeof resetPlan
	| typeof setPlanProducts
	| ( () => { type: 'NOOP' } )
>;
