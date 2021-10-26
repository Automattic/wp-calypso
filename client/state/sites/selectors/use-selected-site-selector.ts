import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { AppState } from 'calypso/types';

export type SelectedSiteSelector< Result > = (
	state: AppState,
	siteId: ReturnType< typeof getSelectedSiteId >
) => Result;

/**
 * Closes over the getSelectedSiteId step when using selected site selectors.
 *
 * Usage:
 *
 *   useSelectedSiteSelector( isJetpackSite );
 *
 * @param selector A selector that takes both state and a site id.
 * @returns A selector that only takes application state for use in useSelector.
 */
export default function useSelectedSiteSelector< Result >(
	selector: SelectedSiteSelector< Result >
): Result {
	return useSelector( ( state ) => selector( state, getSelectedSiteId( state ) ) );
}
