import 'calypso/state/themes/init';
import type { AppState } from 'calypso/types';

/**
 * Checks if the atomic transfer dialog should be shown for a given theme.
 * @param {AppState} state   The app global state
 * @param {string}   themeId The theme ID
 * @returns {boolean}
 */
export function shouldShowAtomicTransferDialog( state: AppState, themeId: string ) {
	return (
		state.themes.themeHasAtomicTransferDialog?.themeId === themeId &&
		state.themes.themeHasAtomicTransferDialog?.show
	);
}
