/**
 * Internal dependencies
 */
import type { Plan, PlanFeature, FeaturesByType, PlanProduct } from './types';

export const setFeatures = ( features: Record< string, PlanFeature > ) => {
	return {
		type: 'SET_FEATURES' as const,
		features,
	};
};

export const setFeaturesByType = ( featuresByType: Array< FeaturesByType > ) => {
	return {
		type: 'SET_FEATURES_BY_TYPE' as const,
		featuresByType,
	};
};

export const setPlans = ( plans: Plan[] ) => {
	return {
		type: 'SET_PLANS' as const,
		plans,
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
