/** @format */

/**
 * Internal dependencies
 */
import {
	I18N_COMMUNITY_TRANSLATOR_TOGGLE_HIDE_DIALOG,
	I18N_COMMUNITY_TRANSLATOR_TOGGLE_SHOW_DIALOG,
	I18N_COMMUNITY_TRANSLATOR_STRING_RECEIVE,
} from 'state/action-types';
import { combineReducers, keyedReducer } from 'state/utils';

export const isOpen = ( state = false, action ) => {
	switch ( action.type ) {
		case I18N_COMMUNITY_TRANSLATOR_TOGGLE_SHOW_DIALOG:
			return true;
		case I18N_COMMUNITY_TRANSLATOR_TOGGLE_HIDE_DIALOG:
			return true;
		default:
			return state;
	}
};

const items = keyedReducer(
	'originalId',
	( state, { type, data } ) => type === I18N_COMMUNITY_TRANSLATOR_STRING_RECEIVE ? data : undefined
);

export default combineReducers( {
	isOpen,
	items,
} );

