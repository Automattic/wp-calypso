/**
 * Internal dependencies
 */
import {
	THEME_SETUP_REQUEST,
	THEME_SETUP_RESULT,
	THEME_SETUP_TOGGLE_DIALOG,
} from 'calypso/state/themes/action-types';
import { withStorageKey } from 'calypso/state/utils';

const initialState = {
	active: false,
	isDialogVisible: false,
	result: false,
};

export const themeSetup = ( state = initialState, action ) => {
	switch ( action.type ) {
		case THEME_SETUP_RESULT:
			return { ...state, active: false, result: action.data };
		case THEME_SETUP_REQUEST:
			return { ...state, active: true, result: false };
		case THEME_SETUP_TOGGLE_DIALOG:
			return { ...state, isDialogVisible: ! state.isDialogVisible, result: false };
	}

	return state;
};

export default withStorageKey( 'themeSetup', themeSetup );
