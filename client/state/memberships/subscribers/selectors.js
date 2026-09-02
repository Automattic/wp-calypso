import 'calypso/state/memberships/init';

const emptyObject = {};

export function getTotalSubscribersForSiteId( state, siteId ) {
	return state?.memberships?.subscribers?.list?.[ siteId ]?.total ?? 0;
}

export function getOwnershipsForSiteId( state, siteId ) {
	return state?.memberships?.subscribers?.list?.[ siteId ]?.ownerships ?? emptyObject;
}
