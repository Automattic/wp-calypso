/** @format */

/**
 * Internal dependencies
 */
import { createReducer, combineReducers, keyedReducer } from 'state/utils';
import { jetpackOnboardingCredentialsSchema, jetpackSettingsSchema } from './schema';
import {
	JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
	JETPACK_ONBOARDING_SETTINGS_UPDATE,
} from 'state/action-types';

export const credentialsReducer = keyedReducer(
	'siteId',
	createReducer(
		{},
		{
			[ JETPACK_ONBOARDING_CREDENTIALS_RECEIVE ]: ( state, { credentials } ) => credentials,
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
			[ JETPACK_ONBOARDING_SETTINGS_UPDATE ]: ( state, { settings } ) => ( {
				...state,
				...settings,
			} ),
		},
		jetpackSettingsSchema
	)
);
settingsReducer.hasCustomPersistence = true;

export default combineReducers( {
	credentials: credentialsReducer,
	settings: settingsReducer,
} );
