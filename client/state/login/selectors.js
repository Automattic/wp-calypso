export const isRequestingLogin = ( state ) => {
	return state.login.isRequesting;
};

export const isLoginSuccessful = ( state ) => {
	return !! state.login.requestSuccess;
};

export const getError = ( state ) => {
	return state.login.requestError;
};

export const isTwoFactorEnabled = ( state ) => {
	return (
		state.twoFactorAuth &&
		state.twoFactorAuth.result &&
		state.twoFactorAuth.twostep_id !== '' &&
		state.twoFactorAuth.twostep_nonce !== ''
	);
};
