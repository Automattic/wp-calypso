/**
 * Internal dependencies
 */
import { createReducerWithValidation, combineReducers, keyedReducer } from 'state/utils';
import credentialsSchema from './schema';
import {
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
} from 'state/action-types';

const credentialsReducer = keyedReducer(
	'siteId',
	createReducerWithValidation(
		{},
		{
			[ JETPACK_ONBOARDING_CREDENTIALS_RECEIVE ]: ( state, { credentials } ) => credentials,
			[ JETPACK_CONNECT_AUTHORIZE_RECEIVE ]: () => undefined,
		},
		credentialsSchema
	)
);
credentialsReducer.hasCustomPersistence = true;

export { credentialsReducer as credentials };

export const reducer = combineReducers( {
	credentials: credentialsReducer,
} );
