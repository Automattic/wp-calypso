import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';

export function isRequestingSitePlans( state, siteId ) {
	const plans = getPlansBySiteId( state, siteId );
	return plans.isRequesting;
}

export function hasLoadedSitePlansFromServer( state, siteId ) {
	const plans = getPlansBySiteId( state, siteId );
	return plans.hasLoadedFromServer;
}
