/**
 * Internal dependencies
 */
import { I18N_LANGUAGE_NAMES_ADD } from 'calypso/state/action-types';

import { combineReducers } from 'calypso/state/utils';

export const items = ( state = null, action ) => {
	switch ( action.type ) {
		case I18N_LANGUAGE_NAMES_ADD:
			return action.items;
		default:
			return state;
	}
};

export default combineReducers( {
	items,
} );
