import { initialSiteState } from './reducer';

export function getPlansBySiteId( state, siteId ) {
	return state.sites.plans[ siteId ] || initialSiteState;
}
