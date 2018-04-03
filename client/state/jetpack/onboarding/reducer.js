/** @format */

/**
 * Internal dependencies
 */
import { createReducer, combineReducers, keyedReducer } from 'state/utils';
import { jetpackOnboardingCredentialsSchema } from './schema';
import {
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
} from 'state/action-types';

const credentialsReducer = keyedReducer(
	'siteId',
	createReducer(
		{},
		{
			[ JETPACK_ONBOARDING_CREDENTIALS_RECEIVE ]: ( state, { credentials } ) => credentials,
			[ JETPACK_CONNECT_AUTHORIZE_RECEIVE ]: () => undefined,
		},
		jetpackOnboardingCredentialsSchema
	)
);
credentialsReducer.hasCustomPersistence = true;

export { credentialsReducer as credentials };

export const reducer = combineReducers( {
	credentials: credentialsReducer,
} );
