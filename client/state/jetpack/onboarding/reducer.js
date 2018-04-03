/** @format */

/**
 * Internal dependencies
 */
import { createReducer, keyedReducer } from 'state/utils';
import { jetpackOnboardingCredentialsSchema } from './schema';
import {
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
} from 'state/action-types';

export const reducer = keyedReducer(
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
reducer.hasCustomPersistence = true;
