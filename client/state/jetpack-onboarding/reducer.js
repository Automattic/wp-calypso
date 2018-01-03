/** @format */

/**
 * Internal dependencies
 */
import { createReducer, combineReducers, keyedReducer } from 'state/utils';
import {
	JETPACK_ONBOARDING_CREDENTIALS_RECEIVE,
	JETPACK_ONBOARDING_SETTINGS_SAVE,
} from 'state/action-types';

export const credentialsReducer = keyedReducer(
	'siteId',
	createReducer(
		{},
		{
			[ JETPACK_ONBOARDING_CREDENTIALS_RECEIVE ]: ( state, { credentials } ) => credentials,
		}
	)
);

export const settingsReducer = keyedReducer(
	'siteId',
	createReducer(
		{},
		{
			[ JETPACK_ONBOARDING_SETTINGS_SAVE ]: ( state, { settings } ) => ( {
				...state,
				...settings,
			} ),
		}
	)
);

export default combineReducers( {
	credentials: credentialsReducer,
	settings: settingsReducer,
} );
