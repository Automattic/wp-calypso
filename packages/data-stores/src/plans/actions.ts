/**
 * Internal dependencies
 */
import type { PlanSlug } from './types';

export const setPrices = ( prices: Record< string, string > ) => {
	return {
		type: 'SET_PRICES' as const,
		prices,
	};
};

export const setPlan = ( slug?: PlanSlug ) => {
	return {
		type: 'SET_PLAN' as const,
		slug: slug,
	};
};

export const resetPlan = () => {
	return {
		type: 'RESET_PLAN' as const,
	};
};

export type PlanAction = ReturnType< typeof setPlan | typeof resetPlan | typeof setPrices >;
