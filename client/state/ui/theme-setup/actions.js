/**
 * Internal dependencies
 */

import {
	THEME_SETUP_OPEN_DIALOG,
} from 'state/action-types';

export function openDialog( saveExisting = true ) {
	return {
		type: THEME_SETUP_OPEN_DIALOG,
		isDialogVisible: true,
		saveExisting,
		active: false,
	};
}

