import 'calypso/state/themes/init';
import type { AppState } from 'calypso/types';

/**
 * Checks if the atomic transfer dialog has been accepted.
 * @param {AppState} state   Global state tree
 * @param {string}   themeId Theme ID to check if the atomic transfer dialog has been accepted.
 * @returns True if the atomic transfer dialog has been accepted. Otherwise, False.
 */
export function wasAtomicTransferDialogAccepted( state: AppState, themeId: string ) {
	return (
		state.themes.themeHasAtomicTransferDialog?.themeId === themeId &&
		state.themes.themeHasAtomicTransferDialog?.accepted
	);
}
