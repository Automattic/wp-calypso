import { initialSiteState } from 'calypso/state/sites/features/reducer';

export default function hasLoadedSiteFeatures( state, siteId ) {
	if ( ! state.sites.features?.[ siteId ] ) {
		return initialSiteState.hasLoadedFromServer;
	}

	return state.sites.features[ siteId ].hasLoadedFromServer || initialSiteState.hasLoadedFromServer;
}
