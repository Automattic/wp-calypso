/**
 * Internal dependencies
 */
import type { APIPlan, PlanSlug } from './types';

export const setPrices = ( prices: Record< PlanSlug, string > ) => {
	return {
		type: 'SET_PRICES' as const,
		prices,
	};
};

export const __internalSetPlans = ( plans: APIPlan[] ) => {
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

export type PlanAction = ReturnType< typeof setPrices | typeof __internalSetPlans >;
