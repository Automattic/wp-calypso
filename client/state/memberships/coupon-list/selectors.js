import 'calypso/state/memberships/init';

const EMPTY_LIST = [];

export function getCouponsForSiteId( state, siteId ) {
	return state.memberships?.couponList.items[ siteId ] ?? EMPTY_LIST;
}
