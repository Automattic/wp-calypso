/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';

import {
	ACCOUNT_RECOVERY_FETCH_SUCCESS,
} from 'state/action-types';

const reducer = createReducer( {}, {
	[ ACCOUNT_RECOVERY_FETCH_SUCCESS ]: ( state, { email, email_validated, phone, phone_validated } ) => ( {
		...state,
		email,
		emailValidated: email_validated,
		phone,
		phoneValidated: phone_validated,
	} ),
} );

export default reducer;
