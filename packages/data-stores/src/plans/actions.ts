export const setPlansDetails = ( plansDetails: Array< Record< string, unknown > > ) => {
	return {
		type: 'SET_PLANS_DETAILS' as const,
		plansDetails,
	};
};

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

export type PlanAction = ReturnType< typeof setPlansDetails | typeof setPrices | typeof resetPlan >;
