/**
 * Internal dependencies
 */
import { dependencyStoreSchema } from './schema';
import { SIGNUP_COMPLETE_RESET, SIGNUP_DEPENDENCY_STORE_UPDATE } from 'state/action-types';
import { createReducer } from 'state/utils';

export default createReducer( {},
	{
		[ SIGNUP_DEPENDENCY_STORE_UPDATE ]: ( state = {}, action ) => {
			return Object.assign( {}, state, action.data );
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return {};
		},
	},
	dependencyStoreSchema
);
