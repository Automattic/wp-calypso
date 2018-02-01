/** @format */

/**
 * Internal dependencies
 */
import {
	I18N_COMMUNITY_TRANSLATOR_TOGGLE_ACTIVATION,
} from 'state/action-types';

import { combineReducers } from 'state/utils';

export const isActivated = ( state = false, action ) => {
	switch ( action.type ) {
		case I18N_COMMUNITY_TRANSLATOR_TOGGLE_ACTIVATION:
			return state.activated;
		default:
			return state;
	}
};

export default combineReducers( {
	isActivated,
} );
