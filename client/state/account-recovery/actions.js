/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

import {
	ACCOUNT_RECOVERY_FETCH,
	ACCOUNT_RECOVERY_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_FETCH_FAILED,
} from 'state/action-types';

export const accountRecoveryFetchSuccess = ( { email, email_validated, phone, phone_validated } ) => {
	return {
		type: ACCOUNT_RECOVERY_FETCH_SUCCESS,
		email,
		email_validated,
		phone,
		phone_validated,
	};
};

export const accountRecoveryFetchFailed = ( error ) => {
	return {
		type: ACCOUNT_RECOVERY_FETCH_FAILED,
		error,
	};
};

export const accountRecoveryFetch = () => ( dispatch ) => {
	dispatch( { type: ACCOUNT_RECOVERY_FETCH } );

	return wpcom.undocumented().me().getAccountRecovery()
		.then( ( accountRecoverySettings ) => {
			dispatch( accountRecoveryFetchSuccess( accountRecoverySettings ) );
		} ).catch( ( error ) => {
			dispatch( accountRecoveryFetchFailed( error ) );
		} );
};
