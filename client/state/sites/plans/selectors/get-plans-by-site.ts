import { initialSiteState } from 'calypso/state/sites/plans/reducer';
import type { SitesPlansResult } from 'calypso/my-sites/checkout/src/hooks/product-variants';
import type { AppState } from 'calypso/types';

export function getPlansBySite(
	state: AppState,
	site: undefined | null | { ID: number | undefined }
) {
	if ( ! site ) {
		return initialSiteState;
	}
	return getPlansBySiteId( state, site.ID );
}

export function getPlansBySiteId( state: AppState, siteId: number | undefined ): SitesPlansResult {
	if ( ! siteId ) {
		return initialSiteState;
	}
	return state.sites.plans[ siteId ] || initialSiteState;
}
