/**
 * External dependencies
 */
import wpcom from 'lib/wp';

/**
 * Internal dependencies
 */
import {
	ACCOUNT_RECOVERY_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_FETCH_FAILED,
} from 'state/action-types';

export const accountRecoveryFetchSuccess = ( accountRecoverySettings ) => {
	return {
		type: ACCOUNT_RECOVERY_FETCH_SUCCESS,
		accountRecoverySettings,
	};
};

export const accountRecoveryFetchFailed = ( error ) => {
	return {
		type: ACCOUNT_RECOVERY_FETCH_FAILED,
		error,
	};
};

export const accountRecoveryFetch = () => {
	return ( dispatch ) => {
		wpcom.undocumented().me().getAccountRecovery( ( error, accountRecoverySettings ) => {
			if ( error ) {
				dispatch( accountRecoveryFetchFailed( error ) );
				return;
			}

			dispatch( accountRecoveryFetchSuccess( accountRecoverySettings ) );
		} );
	};
};
