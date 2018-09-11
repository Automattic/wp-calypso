/** @format */

/**
 * Internal dependencies
 */

import { MEMBERSHIPS_PRODUCTS_LIST, MEMBERSHIPS_PRODUCT_RECEIVE } from 'state/action-types';

import 'state/data-layer/wpcom/sites/memberships';

export const requestProducts = siteId => ( {
	siteId,
	type: MEMBERSHIPS_PRODUCTS_LIST,
} );

export function receiveUpdateProduct( siteId, product ) {
	return {
		siteId,
		type: MEMBERSHIPS_PRODUCT_RECEIVE,
		product,
	};
}

export function receiveDeleteProduct( siteId, productId ) {
	return {
		siteId,
		productId,
		type: 'MEMBERSHIPS_PRODUCT_DELETE',
	};
}
