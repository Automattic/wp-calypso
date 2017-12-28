/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_COMPLETE_RESET, SIGNUP_DEPENDENCY_STORE_UPDATE } from 'client/state/action-types';

import { createReducer } from 'client/state/utils';
import { dependencyStoreSchema } from './schema';

export default createReducer(
	{},
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
