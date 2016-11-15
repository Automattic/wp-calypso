/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';

import {
	ACCOUNT_RECOVERY_SETTINGS_FETCH,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
} from 'state/action-types';

const reducer = createReducer( {}, {
	[ ACCOUNT_RECOVERY_SETTINGS_FETCH ]: ( state ) => ( {
		...state,
		isFetching: true,
	} ),

	[ ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS ]: ( state, { email, email_validated, phone, phone_validated } ) => ( {
		...state,
		email,
		emailValidated: email_validated,
		phone,
		phoneValidated: phone_validated,
		isFetching: false,
	} ),

	[ ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED ]: ( state ) => ( {
		...state,
		isFetching: false,
	} ),
} );

export default reducer;
