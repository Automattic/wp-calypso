import 'calypso/state/reader-ui/init';
import { AppState } from 'calypso/types';

/**
 * Whether or not a specific reader organization sidebar item is open.
 */
export function isOrganizationOpen( state: AppState, organizationId: number ): boolean {
	const openOrganizations = state.readerUi.sidebar.openOrganizations;
	if ( openOrganizations.indexOf( organizationId ) > -1 ) {
		return true;
	}
	return false;
}

/**
 * Whether or not following reader sidebar item is open.
 */
export function isFollowingOpen( state: AppState ): boolean {
	return state.readerUi.sidebar.isFollowingOpen;
}

/**
 * Whether or not lists reader sidebar item is open.
 */
export function isListsOpen( state: AppState ): boolean {
	return state.readerUi.sidebar.isListsOpen;
}

/**
 * Whether or not tags reader sidebar item is open.
 */
export function isTagsOpen( state: AppState ): boolean {
	return state.readerUi.sidebar.isTagsOpen;
}

/**
 * Get the selected feed ID from the reader sidebar.
 */
export function getSelectedFeedId( state: AppState ): number | null {
	return state.readerUi.sidebar.selectedRecentSite;
}
