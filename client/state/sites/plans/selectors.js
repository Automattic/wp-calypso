import { initialSiteState } from './reducer';

export function getPlansBySite( state, site ) {
	if ( ! site ) {
		return initialSiteState;
	}

	return state.sites.plans[ site.ID ] || initialSiteState;
}
