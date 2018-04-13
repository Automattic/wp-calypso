/** @format */

/**
 * External dependencies
 */
import { mapValues, merge } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer, combineReducers, keyedReducer } from 'state/utils';
import { jetpackSettingsSchema } from './schema';
import { normalizeSettings } from './utils';
import {
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_DEACTIVATE_SUCCESS,
	JETPACK_MODULES_RECEIVE,
	JETPACK_SETTINGS_SAVE_SUCCESS,
	JETPACK_SETTINGS_UPDATE,
} from 'state/action-types';

export const settingsReducer = keyedReducer(
	'siteId',
	createReducer(
		{},
		{
			[ JETPACK_MODULE_ACTIVATE_SUCCESS ]: ( state, { moduleSlug } ) => ( {
				...state,
				[ moduleSlug ]: true,
			} ),
			[ JETPACK_MODULE_DEACTIVATE_SUCCESS ]: ( state, { moduleSlug } ) => ( {
				...state,
				[ moduleSlug ]: false,
			} ),
			[ JETPACK_MODULES_RECEIVE ]: ( state, { modules } ) => {
				const modulesActivationState = mapValues( modules, module => module.active );
				// The need for flattening module options into this moduleSettings is temporary.
				// Once https://github.com/Automattic/jetpack/pull/6002 is released,
				// the flattening will be done on the server side for the /jetpack/v4/settings/ endpoint
				const moduleSettings = Object.keys( modules ).reduce( ( allTheSettings, slug ) => {
					return {
						...allTheSettings,
						...mapValues( modules[ slug ].options, option => option.current_value ),
					};
				}, {} );
				return {
					...state,
					...modulesActivationState,
					...normalizeSettings( moduleSettings ),
				};
			},
			[ JETPACK_SETTINGS_SAVE_SUCCESS ]: ( state, { settings: { post_by_email_address } } ) => {
				if ( post_by_email_address && post_by_email_address !== state.post_by_email_address ) {
					return { ...state, post_by_email_address };
				}
				return state;
			},
			[ JETPACK_SETTINGS_UPDATE ]: ( state, { settings } ) => merge( {}, state, settings ),
		},
		jetpackSettingsSchema
	)
);
settingsReducer.hasCustomPersistence = true;

export default combineReducers( {
	settings: settingsReducer,
} );
