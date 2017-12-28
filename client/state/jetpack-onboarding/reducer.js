/** @format */

/**
 * Internal dependencies
 */
import { createReducer, combineReducers, keyedReducer } from 'client/state/utils';
import { JETPACK_ONBOARDING_CREDENTIALS_RECEIVE } from 'client/state/action-types';

export const credentialsReducer = keyedReducer(
	'siteId',
	createReducer(
		{},
		{
			[ JETPACK_ONBOARDING_CREDENTIALS_RECEIVE ]: ( state, { credentials } ) => credentials,
		}
	)
);

export default combineReducers( {
	credentials: credentialsReducer,
} );
