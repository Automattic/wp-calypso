import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { fetchAllPlugins } from 'calypso/state/plugins/installed/actions';
import { getPlugins, isRequestingForAllSites } from 'calypso/state/plugins/installed/selectors';
import getSelectedOrAllSitesWithJetpackPlugin from 'calypso/state/selectors/get-selected-or-all-sites-with-jetpack-plugin';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { AppState } from 'calypso/types';

/**
 * Starts the all-sites plugins fetch before the plugins dashboard first renders.
 *
 * The dashboard's loading flag is only raised once `<QueryPlugins>` dispatches from an
 * effect, which is one render too late: DataViews latches whether it has ever loaded
 * from the flag it sees on its first render, and a dashboard that starts out "not
 * loading" shows the empty "No results" state for the whole fetch instead of a spinner.
 * Dispatching from the route handler puts the request in flight beforehand.
 */
const prefetchAllSitesPlugins =
	() =>
	( dispatch: CalypsoDispatch, getState: () => AppState ): void => {
		const state = getState();

		if ( isRequestingForAllSites( state ) ) {
			return;
		}

		const siteIds = siteObjectsToSiteIds( getSelectedOrAllSitesWithJetpackPlugin( state ) ) ?? [];
		if ( getPlugins( state, siteIds, 'all' ).length ) {
			return;
		}

		dispatch( fetchAllPlugins() );
	};

export default prefetchAllSitesPlugins;
