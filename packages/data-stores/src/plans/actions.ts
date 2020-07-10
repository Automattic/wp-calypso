export const setPrices = ( prices: Record< string, string > ) => {
	return {
		type: 'SET_PRICES' as const,
		prices,
	};
};

export const resetPlan = () => {
	return {
		type: 'RESET_PLAN' as const,
	};
};

export type PlanAction = ReturnType< typeof setPrices >;
