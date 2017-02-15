/**
 * External dependencies
 */
import { get } from 'lodash';

export const isRequestingLogin = ( state ) => {
	return state.login.isRequesting;
};

export const isLoginSuccessful = ( state ) => {
	return !! state.login.requestSuccess;
};

export const getError = ( state ) => {
	return state.login.requestError;
};

export const getTwoFactorAuthId = ( state ) => {
	return get( state, [ 'login', 'twoFactorAuth', 'twostep_id' ], null );
};

export const getTwoFactorAuthNonce = ( state ) => {
	return get( state, [ 'login', 'twoFactorAuth', 'twostep_nonce' ], null );
};

export const isTwoFactorEnabled = ( state ) => {
	return (
		state.login.twoFactorAuth &&
		state.login.twoFactorAuth.result &&
		state.login.twoFactorAuth.twostep_id !== '' &&
		state.login.twoFactorAuth.twostep_nonce !== ''
	);
};
