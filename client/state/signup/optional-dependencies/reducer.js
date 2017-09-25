/**
 * Internal dependencies
 */
import { suggestedUsernameSchema } from './schema';
import { SIGNUP_OPTIONAL_DEPENDENCY_SUGGESTED_USERNAME_SET } from 'state/action-types';
import { combineReducers, createReducer } from 'state/utils';

const suggestedUsername = createReducer( '',
	{
		[ SIGNUP_OPTIONAL_DEPENDENCY_SUGGESTED_USERNAME_SET ]: ( state, action ) => {
			return action.data;
		}
	},
	suggestedUsernameSchema
);

export default combineReducers( {
	suggestedUsername
} );
