import 'calypso/state/themes/init';
import type { AppState } from 'calypso/types';

/**
 * Gets the theme ID for which the atomic transfer dialog should be shown.
 * @param {AppState} state The app global state
 * @returns {null|string} The theme ID
 */
export function getThemeForAtomicTransferDialog( state: AppState ) {
	return state.themes.themeHasAtomicTransferDialog?.themeId;
}
