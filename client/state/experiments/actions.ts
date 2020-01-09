/**
 * Gets experiment variations for the current user
 */
export const assignCurrentUserToVariations = () => ( dispatch: any, getState: any ) => {
	const anonId = getState().experiments.anonId;
	const userId = getState().currentUser.id;
	dispatch( {
		type: 'GET_EXPERIMENT_VARIATIONS',
		anonId: anonId,
		userId: userId,
	} );
};
