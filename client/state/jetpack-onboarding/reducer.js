/** @format */

/**
 * External dependencies
 */
import { merge } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer, combineReducers, keyedReducer } from 'state/utils';
import { jetpackOnboardingCredentialsSchema, jetpackSettingsSchema } from './schema';
import {
	JETPACK_CONNECT_AUTHORIZE_RECEIVE,
	JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
	JETPACK_ONBOARDING_SETTINGS_UPDATE,
} from 'state/action-types';

export const credentialsReducer = keyedReducer(
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

export const settingsReducer = keyedReducer(
	'siteId',
	createReducer(
		{},
		{
			[ JETPACK_ONBOARDING_SETTINGS_UPDATE ]: ( state, { settings } ) =>
				merge( {}, state, settings ),
		},
		jetpackSettingsSchema
	)
);
settingsReducer.hasCustomPersistence = true;

export default combineReducers( {
	credentials: credentialsReducer,
	settings: settingsReducer,
} );
