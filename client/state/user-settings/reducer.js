/**
 * External dependencies
 */

import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import {
	USER_SETTINGS_UPDATE,
	USER_SETTINGS_UNSAVED_CLEAR,
	USER_SETTINGS_UNSAVED_SET,
	USER_SETTINGS_UNSAVED_REMOVE,
} from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';

export const settings = ( state = null, { type, settingValues } ) =>
	USER_SETTINGS_UPDATE === type ? { ...state, ...settingValues } : state;

export const unsavedSettings = ( state = {}, action ) => {
	switch ( action.type ) {
		case USER_SETTINGS_UNSAVED_CLEAR:
			// After a successful save, remove the saved settings (either all of them,
			// or a subset) from the `unsavedSettings`.
			if ( ! action.settingNames ) {
				return {};
			}
			return omit( state, action.settingNames );

		case USER_SETTINGS_UNSAVED_SET:
			if ( state[ action.settingName ] === action.value ) {
				return state;
			}
			return { ...state, [ action.settingName ]: action.value };

		case USER_SETTINGS_UNSAVED_REMOVE:
			return omit( state, action.settingName );

		default:
			return state;
	}
};

export default combineReducers( {
	settings,
	unsavedSettings,
} );
