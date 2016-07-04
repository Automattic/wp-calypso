/**
 * Internal dependencies
 */
import {
	SIGNUP_DEPENDENCY_STORE_RESET,
	SIGNUP_DEPENDENCY_STORE_UPDATE_STATE,
} from 'state/action-types';

import { createReducer } from 'state/utils';

export default createReducer( {},
	{
		[ SIGNUP_DEPENDENCY_STORE_UPDATE_STATE ]: ( state = {}, action ) => {
			return Object.assign( {}, state, action.data );
		},
		[ SIGNUP_DEPENDENCY_STORE_RESET ]: () => {
			return {};
		}
	}
);
