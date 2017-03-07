/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
} from 'state/action-types';

export const requestResetOptions = ( { dispatch }, { userData } ) => (
	wpcom.undocumented().accountRecoveryReset( userData ).getResetOptions()
		.then( options => dispatch( {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
			options,
		} ) )
		.catch( error => dispatch( {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
			error,
		} ) )
);
