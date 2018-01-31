/** @format */

/**
 * Internal dependencies
 */
import {
	I18N_COMMUNITY_TRANSLATOR_ACTIVATE,
	I18N_COMMUNITY_TRANSLATOR_DEACTIVATE,
} from 'state/action-types';

import { combineReducers } from 'state/utils';

export const isEnabled = ( state = false, action ) => {
	switch ( action.type ) {
		case I18N_COMMUNITY_TRANSLATOR_ACTIVATE:
			return true;
		case I18N_COMMUNITY_TRANSLATOR_DEACTIVATE:
			return false;
		default:
			return state;
	}
};

export default combineReducers( {
	isEnabled,
} );
