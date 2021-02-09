/**
 * Internal dependencies
 */
import type { Plan, PlanFeature, FeaturesByType, PlanProduct } from './types';

export const setFeatures = ( features: Record< string, PlanFeature >, locale: string ) => {
	return {
		type: 'SET_FEATURES' as const,
		features,
		locale,
	};
};

export const setFeaturesByType = ( featuresByType: Array< FeaturesByType >, locale: string ) => {
	return {
		type: 'SET_FEATURES_BY_TYPE' as const,
		featuresByType,
		locale,
	};
};

export const setPlans = ( plans: Plan[], locale: string ) => {
	return {
		type: 'SET_PLANS' as const,
		plans,
		locale,
	};
};

export const setPlanProducts = ( products: PlanProduct[] ) => {
	return {
		type: 'SET_PLAN_PRODUCTS' as const,
		products,
	};
};

export const resetPlan = () => {
	return {
		type: 'RESET_PLAN' as const,
	};
};

export type PlanAction = ReturnType<
	| typeof setFeatures
	| typeof setFeaturesByType
	| typeof setPlans
	| typeof resetPlan
	| typeof setPlanProducts
>;
