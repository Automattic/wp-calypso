import {
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_DEACTIVATE_SUCCESS,
	JETPACK_MODULES_RECEIVE,
	JETPACK_SETTINGS_SAVE_SUCCESS,
	JETPACK_SETTINGS_UPDATE,
} from 'calypso/state/action-types';
import { combineReducers, keyedReducer, withSchemaValidation } from 'calypso/state/utils';
import { jetpackSettingsSchema } from './schema';
import { normalizeSettings } from './utils';

export const settingsReducer = keyedReducer(
	'siteId',
	withSchemaValidation( jetpackSettingsSchema, ( state = {}, action ) => {
		switch ( action.type ) {
			case JETPACK_MODULE_ACTIVATE_SUCCESS: {
				const { moduleSlug } = action;

				return {
					...state,
					[ moduleSlug ]: true,
				};
			}
			case JETPACK_MODULE_DEACTIVATE_SUCCESS: {
				const { moduleSlug } = action;

				return {
					...state,
					[ moduleSlug ]: false,
				};
			}
			case JETPACK_MODULES_RECEIVE: {
				const { modules } = action;
				const modulesActivationState = Object.fromEntries(
					Object.entries( modules ).map( ( [ key, module ] ) => [ key, module.active ] )
				);
				// The need for flattening module options into this moduleSettings is temporary.
				// Once https://github.com/Automattic/jetpack/pull/6002 is released,
				// the flattening will be done on the server side for the /jetpack/v4/settings/ endpoint
				const moduleSettings = Object.keys( modules ).reduce( ( allTheSettings, slug ) => {
					return {
						...allTheSettings,
						...Object.fromEntries(
							Object.entries( modules[ slug ]?.options ?? {} ).map( ( [ key, option ] ) => [
								key,
								option.current_value,
							] )
						),
					};
				}, {} );
				return {
					...state,
					...modulesActivationState,
					...normalizeSettings( moduleSettings ),
				};
			}
			case JETPACK_SETTINGS_SAVE_SUCCESS: {
				const {
					settings: { post_by_email_address },
				} = action;
				if ( post_by_email_address && post_by_email_address !== state.post_by_email_address ) {
					return { ...state, post_by_email_address };
				}
				return state;
			}
			case JETPACK_SETTINGS_UPDATE: {
				return {
					...state,
					...action.settings,
				};
			}
		}

		return state;
	} )
);

export default combineReducers( {
	settings: settingsReducer,
} );
