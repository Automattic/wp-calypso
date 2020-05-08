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
