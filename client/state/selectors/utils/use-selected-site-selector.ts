import { useSelector } from 'react-redux';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { AppState } from 'calypso/types';

export type SelectedSiteSelector = ( state: AppState, siteId: number ) => any;

/**
 * Use Selected Site Selector
 *
 * Closes over the getSelectedSiteId step when using selected site selectors.
 *
 * @param selector
 * @returns
 */
export default function useSelectedSiteSelector( selector: SelectedSiteSelector ): any {
	const siteId = useSelector( getSelectedSiteId ) as number;
	return useSelector( ( state: AppState ) => selector( state, siteId ) );
}
