import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { AppState } from 'calypso/types';

export type SelectedSiteSelector< Params extends any[], Result > = (
	state: AppState,
	siteId: ReturnType< typeof getSelectedSiteId >,
	...args: Params
) => Result;

/**
 * Wraps useSelector and closes over the getSelectedSiteId step when using selected site selectors.
 *
 * Usage:
 *   useSelectedSiteSelector( isJetpackSite );
 *   useSelectedSiteSelector( getPlansForFeature, FEATURE_WP_SUBDOMAIN );
 * @param selector A selector that takes state, a site id and any additional params.
 * @returns The result of the selector applied to application state.
 */
export default function useSelectedSiteSelector< Params extends any[], Result >(
	selector: SelectedSiteSelector< Params, Result >,
	...args: Params
): Result {
	return useSelector( ( state ) => selector( state, getSelectedSiteId( state ), ...args ) );
}
