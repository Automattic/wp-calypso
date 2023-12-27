import 'calypso/state/memberships/init';

export function getCouponsForSiteId( state, siteId ) {
	return state.memberships?.couponList.items[ siteId ] ?? [];
}
