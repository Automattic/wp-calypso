export const isRequestingLogin = ( state ) => {
	return state.login.isRequesting;
};

export const isLoginSuccessful = ( state ) => {
	return !! state.login.requestSuccess;
};

export const getError = ( state ) => {
	return state.login.requestError;
};
