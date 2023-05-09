import { initialSiteState } from 'calypso/state/sites/features/reducer';

export default function getFeaturesBySiteId( state, siteId ) {
	if ( ! siteId ) {
		return initialSiteState.data;
	}

	if ( ! state.sites.features?.[ siteId ] ) {
		return null;
	}

	return state.sites.features[ siteId ].data || initialSiteState.data;
}
