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
 *   useSelector( withSelectedSite( isJetpackSite ) );
 *
 * @param selector A selector that takes both state and a site id.
 * @returns A selector that only takes application state for use in useSelector.
 */
export default function withSelectedSite< Result >(
	selector: SelectedSiteSelector< Result >
): ( state: AppState ) => Result {
	return ( state ) => selector( state, getSelectedSiteId( state ) );
}
