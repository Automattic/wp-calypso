/**
 * Internal dependencies
 */
import {
	THEME_SETUP_CLOSE_DIALOG,
	THEME_SETUP_OPEN_DIALOG,
} from 'state/action-types';

export function openDialog( saveExisting = true ) {
	return {
		type: THEME_SETUP_OPEN_DIALOG,
		saveExisting,
	};
}

export function closeDialog() {
	return {
		type: THEME_SETUP_CLOSE_DIALOG,
	};
}

