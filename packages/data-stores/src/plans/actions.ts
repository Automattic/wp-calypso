/**
 * Internal dependencies
 */
import type { Plan, PlanFeature, FeaturesByType } from './types';

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

export const setPlans = ( plans: Record< string, Plan > ) => {
	return {
		type: 'SET_PLANS' as const,
		plans,
	};
};

export const resetPlan = () => {
	return {
		type: 'RESET_PLAN' as const,
	};
};

export type PlanAction = ReturnType<
	typeof setFeatures | typeof setFeaturesByType | typeof setPlans | typeof resetPlan
>;
