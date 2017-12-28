/** @format */

/**
 * Internal dependencies
 */

import { SIGNUP_OPTIONAL_DEPENDENCY_SUGGESTED_USERNAME_SET } from 'client/state/action-types';
import { combineReducers, createReducer } from 'client/state/utils';
import { suggestedUsernameSchema } from './schema';

const suggestedUsername = createReducer(
	'',
	{
		[ SIGNUP_OPTIONAL_DEPENDENCY_SUGGESTED_USERNAME_SET ]: ( state, action ) => {
			return action.data;
		},
	},
	suggestedUsernameSchema
);

export default combineReducers( {
	suggestedUsername,
} );
