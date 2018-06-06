/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_COMPLETE_RESET, SIGNUP_DEPENDENCY_STORE_UPDATE } from 'state/action-types';

import { createReducer } from 'state/utils';
import { dependencyStoreSchema } from './schema';

export default createReducer(
	{},
	{
		[ SIGNUP_DEPENDENCY_STORE_UPDATE ]: ( state = {}, action ) => {
			return { ...state, ...action.data };
		},
		[ SIGNUP_COMPLETE_RESET ]: () => {
			return {};
		},
	},
	dependencyStoreSchema
);
