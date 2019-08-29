/**
 * Internal dependencies
 */
import { SIGNUP_OPTIONAL_DEPENDENCY_SUGGESTED_USERNAME_SET } from 'state/action-types';
import { combineReducers, createReducerWithValidation } from 'state/utils';
import { suggestedUsernameSchema } from './schema';

const suggestedUsername = createReducerWithValidation(
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
