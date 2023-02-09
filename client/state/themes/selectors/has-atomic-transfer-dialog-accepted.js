import 'calypso/state/themes/init';

/**
 * Checks if the atomic transfer dialog has been accepted.
 *
 * @param {Object} state   Global state tree
 * @param {string} themeId Theme ID to check if the atomic transfer dialog has been accepted.
 * @returns True if the atomic transfer dialog has been accepted. Otherwise, False.
 */
export function hasAtomicTransferDialogAccepted( state, themeId ) {
	return (
		state.themes.themeHasAtomicTransferDialog?.themeId === themeId &&
		state.themes.themeHasAtomicTransferDialog?.accepted
	);
}
