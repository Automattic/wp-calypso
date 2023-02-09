import 'calypso/state/themes/init';
import { AppState } from 'calypso/types';

/**
 * Checks if the atomic transfer dialog should be shown for a given theme.
 *
 * @param state The app global state
 * @param themeId The theme ID
 * @returns
 */
export function shouldShowAtomicTransferDialog( state: AppState, themeId: string ) {
	return (
		state.themes.themeHasAtomicTransferDialog?.themeId === themeId &&
		state.themes.themeHasAtomicTransferDialog?.show
	);
}
