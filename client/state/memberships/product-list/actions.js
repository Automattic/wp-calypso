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
	MEMBERSHIPS_PRODUCT_DELETE,
	MEMBERSHIPS_PRODUCT_DELETE_FAILURE,
} from 'calypso/state/action-types';
import wpcom from 'calypso/lib/wp';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { membershipProductFromApi } from 'calypso/state/data-layer/wpcom/sites/memberships';

import 'calypso/state/memberships/init';

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
				dispatch(
					successNotice( noticeText, {
						duration: 5000,
					} )
				);
				return membershipProduct;
			} )
			.catch( ( error ) => {
				dispatch( {
					type: MEMBERSHIPS_PRODUCT_ADD_FAILURE,
					siteId,
					error,
				} );
				dispatch(
					errorNotice( error.message, {
						duration: 10000,
					} )
				);
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
				dispatch(
					successNotice( noticeText, {
						duration: 5000,
					} )
				);
				return membershipProduct;
			} )
			.catch( ( error ) => {
				dispatch( {
					type: MEMBERSHIPS_PRODUCT_UPDATE_FAILURE,
					siteId,
					error,
				} );
				dispatch(
					errorNotice( error.message, {
						duration: 10000,
					} )
				);
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
				dispatch(
					successNotice( noticeText, {
						duration: 5000,
					} )
				);
				return product.ID;
			} )
			.catch( ( error ) => {
				dispatch( {
					type: MEMBERSHIPS_PRODUCT_DELETE_FAILURE,
					siteId,
					error,
					product,
				} );
				dispatch(
					errorNotice( error.message, {
						duration: 10000,
					} )
				);
			} );
	};
};
