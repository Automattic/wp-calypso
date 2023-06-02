import { initialSiteState } from 'calypso/state/sites/features/reducer';

export default function isRequestingSiteFeatures( state, siteId ) {
	if ( ! state.sites.features?.[ siteId ] ) {
		return initialSiteState.isRequesting;
	}

	return state.sites.features[ siteId ].isRequesting || initialSiteState.isRequesting;
}
