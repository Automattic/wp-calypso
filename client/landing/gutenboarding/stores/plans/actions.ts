/**
 * Internal dependencies
 */
import { Feature, Plan } from './types';

export const setPrices = ( prices: Record< string, string > ) => {
	return {
		type: 'SET_PRICES' as const,
		prices,
	};
};
export const setFeatures = ( features: Feature[] ) => {
	return {
		type: 'SET_FEATURES' as const,
		features,
	};
};

export const setSupportedPlans = ( plans: Record< string, Plan > ) => {
	return {
		type: 'SET_PLANS' as const,
		plans,
	};
};

export const setPlan = ( slug: string | undefined ) => {
	return {
		type: 'SET_PLAN' as const,
		slug,
	};
};

export const resetPlan = () => {
	return {
		type: 'RESET_PLAN' as const,
	};
};

export type PlanAction = ReturnType<
	| typeof setPlan
	| typeof resetPlan
	| typeof setPrices
	| typeof setSupportedPlans
	| typeof setFeatures
>;
