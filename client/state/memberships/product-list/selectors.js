/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/memberships/init';

export function getProductsForSiteId( state, siteId ) {
	return get( state, [ 'memberships', 'productList', 'items', siteId ] );
}
