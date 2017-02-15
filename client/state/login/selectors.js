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
		state.login.twoFactorAuth &&
		state.login.twoFactorAuth.result &&
		state.login.twoFactorAuth.twostep_id !== '' &&
		state.login.twoFactorAuth.twostep_nonce !== ''
	);
};
