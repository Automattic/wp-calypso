/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

import {
	ACCOUNT_RECOVERY_FETCH,
	ACCOUNT_RECOVERY_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_FETCH_FAILED,
} from 'state/action-types';

export const accountRecoveryFetchSuccess = ( accountRecoverySettings ) => {
	return {
		type: ACCOUNT_RECOVERY_FETCH_SUCCESS,
		...accountRecoverySettings,
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
		} ).catch( ( { status, message } ) => {
			dispatch( accountRecoveryFetchFailed( { status, message } ) );
		} );
};
