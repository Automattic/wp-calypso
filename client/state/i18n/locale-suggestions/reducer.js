/** @format */

/**
 * Internal dependencies
 */
import { I18N_LOCALE_SUGGESTIONS_SUCCESS } from 'state/action-types';

import { combineReducers } from 'state/utils';

export const items = ( state = null, action ) => {
	switch ( action.type ) {
		case I18N_LOCALE_SUGGESTIONS_SUCCESS:
			return action.items;
		default:
			return state;
	}
};

export default combineReducers( {
	items,
} );
