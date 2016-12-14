/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	SIGNUP_OPTIONAL_DEPENDENCY_SUGGESTED_USERNAME_SET,
} from 'state/action-types';

import { createReducer } from 'state/utils';
import { suggestedUsernameSchema } from './schema';

const suggestedUsername = createReducer( '',
	{
		[ SIGNUP_OPTIONAL_DEPENDENCY_SUGGESTED_USERNAME_SET ]: ( state = null, action ) => {
			return action.data;
		}
	},
	suggestedUsernameSchema
);

export default combineReducers( {
	suggestedUsername
} );

