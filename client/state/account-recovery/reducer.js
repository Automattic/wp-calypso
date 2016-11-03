/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import {
	ACCOUNT_RECOVERY_FETCH_SUCCESS,
} from 'state/action-types';

const reducer = ( state = {}, action ) => {
	switch ( action.type ) {
		case ACCOUNT_RECOVERY_FETCH_SUCCESS:
			const {
				email,
				email_validated: emailValidated,
				phone,
				phone_validated: phoneValidated,
			} = action.accountRecoverySettings;
			return Object.assign( {}, state, { email, emailValidated, phone, phoneValidated } );
	}

	return state;
};

export default reducer;
