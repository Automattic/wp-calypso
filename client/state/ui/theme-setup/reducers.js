/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import {
	THEME_SETUP_CLOSE_DIALOG,
	THEME_SETUP_FAILURE,
	THEME_SETUP_OPEN_DIALOG,
	THEME_SETUP_REQUEST,
	THEME_SETUP_SUCCESS,
} from 'state/action-types';

const initialState = {
	active: false,
	isDialogVisible: false,
	saveExisting: true,
};

export const themeSetup = ( state = initialState, action ) => {
	switch ( action.type ) {
		case THEME_SETUP_FAILURE:
		case THEME_SETUP_SUCCESS:
			return { ...state, isDialogVisible: true, active: false };
		case THEME_SETUP_REQUEST:
			return { ...state, active: true };
		case THEME_SETUP_OPEN_DIALOG:
			return { ...state, isDialogVisible: true, saveExisting: action.saveExisting };
		case THEME_SETUP_CLOSE_DIALOG:
			return { ...state, isDialogVisible: false };
	}

	return state;
};

export default themeSetup;

