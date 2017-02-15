/**
 * External dependencies
 */
import { get } from 'lodash';

export const isRequestingLogin = ( state ) => {
	return get( state, [ 'login', 'isRequesting' ], false );
};

export const isLoginSuccessful = ( state ) => {
	return get( state, [ 'login', 'requestSuccess' ], false );
};

export const getError = ( state ) => {
	return get( state, [ 'login', 'requestError' ], null );
};

export const getTwoFactorAuthId = ( state ) => {
	return get( state, [ 'login', 'twoFactorAuth', 'twostep_id' ], null );
};

export const getTwoFactorAuthNonce = ( state ) => {
	return get( state, [ 'login', 'twoFactorAuth', 'twostep_nonce' ], null );
};

export const getVerificationCodeSubmissionError = ( state ) => {
	return state.login.verificationCodeSubmissionError;
};

export const isTwoFactorEnabled = ( state ) => {
	const twoFactorAuth = get( state, [ 'login', 'twoFactorAuth' ] );
	if ( ! twoFactorAuth ) {
		return null;
	}

	return (
		twoFactorAuth.result &&
		twoFactorAuth.twostep_id !== '' &&
		twoFactorAuth.twostep_nonce !== ''
	);
};
