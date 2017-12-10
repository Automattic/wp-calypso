/** @format */

/**
 * Internal dependencies
 */
import {
	I18N_LANGUAGE_NAMES_REQUEST,
	I18N_LANGUAGE_NAMES_REQUEST_SUCCESS,
	I18N_LANGUAGE_NAMES_REQUEST_FAILURE,
} from 'state/action-types';

import { combineReducers } from 'state/utils';

export const isFetching = ( state = false, action ) => {
	switch ( action.type ) {
		case I18N_LANGUAGE_NAMES_REQUEST:
			return true;
		case I18N_LANGUAGE_NAMES_REQUEST_SUCCESS:
		case I18N_LANGUAGE_NAMES_REQUEST_FAILURE:
			return false;
		default:
			return false;
	}
};

export const error = ( state = null, action ) => {
	switch ( action.type ) {
		case I18N_LANGUAGE_NAMES_REQUEST_SUCCESS:
			return null;
		case I18N_LANGUAGE_NAMES_REQUEST_FAILURE:
			return action.error;
		default:
			return null;
	}
};

export const items = ( state = {}, action ) => {
	switch ( action.type ) {
		case I18N_LANGUAGE_NAMES_REQUEST_SUCCESS:
			return action.items;
		default:
			return state;
	}
};

export default combineReducers( {
	isFetching,
	error,
	items,
} );
