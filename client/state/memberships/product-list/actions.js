/**
 * Internal dependencies
 */

import {
	MEMBERSHIPS_PRODUCTS_LIST,
	MEMBERSHIPS_PRODUCT_RECEIVE,
	MEMBERSHIPS_PRODUCT_ADD,
	MEMBERSHIPS_PRODUCT_ADD_FAILURE,
	MEMBERSHIPS_PRODUCT_UPDATE,
	MEMBERSHIPS_PRODUCT_UPDATE_FAILURE,
	NOTICE_CREATE,
	MEMBERSHIPS_PRODUCT_DELETE,
	MEMBERSHIPS_PRODUCT_DELETE_FAILURE,
} from 'state/action-types';

import wpcom from 'lib/wp';
import { membershipProductFromApi } from 'state/data-layer/wpcom/sites/memberships';

export const requestProducts = ( siteId ) => ( {
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
	return ( dispatch ) => {
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
				},
				product
			)
			.then( ( newProduct ) => {
				const membershipProduct = membershipProductFromApi( newProduct.product );
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
			.catch( ( error ) => {
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

export const requestUpdateProduct = ( siteId, product, noticeText ) => {
	return ( dispatch ) => {
		dispatch( {
			type: MEMBERSHIPS_PRODUCT_UPDATE,
			siteId,
			product,
		} );

		return wpcom.req
			.post(
				{
					method: 'POST',
					path: `/sites/${ siteId }/memberships/product/${ product.ID }`,
				},
				product
			)
			.then( ( newProduct ) => {
				const membershipProduct = membershipProductFromApi( newProduct.product );
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
			.catch( ( error ) => {
				dispatch( {
					type: MEMBERSHIPS_PRODUCT_UPDATE_FAILURE,
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

export const requestDeleteProduct = ( siteId, product, noticeText ) => {
	return ( dispatch ) => {
		dispatch( {
			type: MEMBERSHIPS_PRODUCT_DELETE,
			siteId,
			product,
		} );

		return wpcom.req
			.post( {
				method: 'POST',
				path: `/sites/${ siteId }/memberships/product/${ product.ID }/delete`,
			} )
			.then( () => {
				dispatch( {
					type: NOTICE_CREATE,
					notice: {
						duration: 5000,
						text: noticeText,
						status: 'is-success',
					},
				} );
				return product.ID;
			} )
			.catch( ( error ) => {
				dispatch( {
					type: MEMBERSHIPS_PRODUCT_DELETE_FAILURE,
					siteId,
					error,
					product,
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
