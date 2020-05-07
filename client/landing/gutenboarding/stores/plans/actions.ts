export const setPlan = ( slug: string | undefined ) => {
	return {
		type: 'SET_PLAN' as const,
		slug,
	};
};
