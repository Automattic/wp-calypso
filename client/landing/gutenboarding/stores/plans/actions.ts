export const setPrices = ( prices: Record< string, string > ) => {
	return {
		type: 'SET_PRICES' as const,
		prices,
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

export type PlanAction = ReturnType< typeof setPlan | typeof resetPlan | typeof setPrices >;
