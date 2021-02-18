/**
 * Internal dependencies
 */
import 'calypso/state/memberships/init';

const EMPTY_LIST = [];

export function getProductsForSiteId( state, siteId ) {
	return state.memberships?.productList.items[ siteId ] ?? EMPTY_LIST;
}
