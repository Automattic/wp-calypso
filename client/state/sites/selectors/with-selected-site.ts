import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { AppState } from 'calypso/types';

export type SelectedSiteSelector = ( state: AppState, siteId: number | null ) => unknown;

/**
 * withSelectedSite
 *
 * Closes over the getSelectedSiteId step when using selected site selectors.
 *
 * Usage:
 *
 *   useSelector( withSelectedSite( isJetpackSite ) );
 *
 * @param selector
 * @returns
 */
export default function withSelectedSite( selector: SelectedSiteSelector ) {
	return ( state: AppState ): unknown => {
		const siteId = getSelectedSiteId( state );
		return selector( state, siteId );
	};
}
