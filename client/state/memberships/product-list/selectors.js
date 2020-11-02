/**
 * Internal dependencies
 */
import 'calypso/state/memberships/init';

export function getProductsForSiteId( state, siteId ) {
	return state.memberships?.productList.items[ siteId ] ?? [];
}
