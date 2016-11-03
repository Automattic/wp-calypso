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
			return Object.assign( {}, state, action.accountRecoverySettings );
	}

	return state;
};

export default reducer;
