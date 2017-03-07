/**
 * Internal dependencies
 */
import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
} from 'state/action-types';

const fetchResetOptions = userData => ( {
	type: ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
	userData,
} );

export const fetchResetOptionsByLogin = user => fetchResetOptions( { user } );

export const fetchResetOptionsByNameAndUrl = ( firstname, lastname, url ) =>
	fetchResetOptions( { firstname, lastname, url } );

export const fetchResetOptionsSuccess = ( options ) => ( {
	type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	options,
} );

export const fetchResetOptionsError = ( error ) => {
	return {
		type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
		error,
	};
};

export const updatePasswordResetUserData = ( userData ) => ( {
	type: ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
	userData,
} );
