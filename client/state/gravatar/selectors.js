export const isRequestingGravatar = ( state ) => {
	return state.gravatar && state.gravatar.isRequesting;
};
