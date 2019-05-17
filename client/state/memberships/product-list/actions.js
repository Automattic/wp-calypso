/** @format */

/**
 * Internal dependencies
 */

import {
	MEMBERSHIPS_PRODUCTS_LIST,
	MEMBERSHIPS_PRODUCT_RECEIVE,
	MEMBERSHIPS_PRODUCT_ADD,
	MEMBERSHIPS_PRODUCT_ADD_FAILURE,
	NOTICE_CREATE,
} from 'state/action-types';

import wpcom from 'lib/wp';
import { membershipProductFromApi } from 'state/data-layer/wpcom/sites/memberships';

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

export const requestAddProduct = ( siteId, product, noticeText ) => {
	return dispatch => {
		dispatch( {
			type: MEMBERSHIPS_PRODUCT_ADD,
			siteId,
			product,
		} );

		return wpcom.req
			.post(
				{
					method: 'POST',
					path: `/sites/${ siteId }/memberships/product`,
					apiNamespace: 'wpcom/v2',
				},
				product
			)
			.then( newProduct => {
				const membershipProduct = membershipProductFromApi( newProduct );
				dispatch( receiveUpdateProduct( siteId, membershipProduct ) );
				dispatch( {
					type: NOTICE_CREATE,
					notice: {
						duration: 5000,
						text: noticeText,
						status: 'is-success',
					},
				} );
				return membershipProduct;
			} )
			.catch( error => {
				dispatch( {
					type: MEMBERSHIPS_PRODUCT_ADD_FAILURE,
					siteId,
					error,
				} );
				dispatch( {
					type: NOTICE_CREATE,
					notice: {
						duration: 10000,
						text: error.message,
						status: 'is-error',
					},
				} );
			} );
	};
};
