import 'calypso/state/themes/init';
import { AppState } from 'calypso/types';

/**
 * Gets the theme ID for which the atomic transfer dialog should be shown.
 *
 * @param state The app global state
 * @returns The theme ID
 */
export function getThemeForAtomicTransferDialog( state: AppState ) {
	return state.themes.themeHasAtomicTransferDialog?.themeId;
}
