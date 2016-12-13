/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
} from 'state/action-types';

export function fetchResetOptions( userData ) {
	return ( dispatch ) => {
		dispatch( { type: ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST } );

		wpcom.undocumented().accountRecoveryReset( userData ).getResetOptions()
			.then( options => dispatch( { type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE, options } ) )
			.catch( error => dispatch( { type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR, error } ) );
	};
}

export function fetchResetOptionsByLogin( user ) {
	return fetchResetOptions( { user } );
}

export function fetchResetOptionsByName( firstname, lastname, url ) {
	return fetchResetOptions( { firstname, lastname, url } );
}
