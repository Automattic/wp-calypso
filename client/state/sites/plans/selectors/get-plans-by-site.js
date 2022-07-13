import { initialSiteState } from 'calypso/state/sites/plans/reducer';

export function getPlansBySite( state, site ) {
	if ( ! site ) {
		return initialSiteState;
	}
	return getPlansBySiteId( state, site.ID );
}

/**
 * Returns plans for a site Id
 *
 * @param  {object} state        global state
 * @param  {number|undefined} siteId       the site id
 * @returns {import('calypso/my-sites/checkout/composite-checkout/hooks/product-variants').SitesPlansResult} the matching plan
 */
export function getPlansBySiteId( state, siteId ) {
	if ( ! siteId ) {
		return initialSiteState;
	}
	return state.sites.plans[ siteId ] || initialSiteState;
}
