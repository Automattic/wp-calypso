import wpcom from 'calypso/lib/wp';
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
import { membershipProductFromApi } from 'calypso/state/data-layer/wpcom/sites/memberships';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

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
					apiNamespace: 'wpcom/v2',
				},
				product
			)
			.then( ( newProduct ) => {
				if ( newProduct.error ) {
					throw new Error( newProduct.error );
				}
				const membershipProduct = membershipProductFromApi( newProduct );
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
					apiNamespace: 'wpcom/v2',
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
				method: 'DELETE',
				path: `/sites/${ siteId }/memberships/product/${ product.ID }`,
				apiNamespace: 'wpcom/v2',
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

const addNewAnnualProduct = ( annualProduct, siteId, noticeText ) => ( membershipProduct ) => {
	debugger;
	const newMembershipProductId = membershipProduct.id;
	annualProduct.type = 'tier-' + newMembershipProductId;
	return requestAddProduct( siteId, annualProduct, noticeText );
};

export const requestAddTier = ( siteId, product, annualProduct, noticeText ) => {
	return requestAddProduct( siteId, product, noticeText ).then(
		addNewAnnualProduct( annualProduct, siteId, noticeText )
	);
};

export const requestUpdateTier = ( siteId, product, annualProduct, noticeText ) => {
	return requestUpdateProduct( siteId, product, noticeText ).then( ( membershipProduct ) => {
		if ( annualProduct.ID ) {
			return requestUpdateProduct( siteId, annualProduct, noticeText );
		}

		// The annual product does not exist yet
		return addNewAnnualProduct( annualProduct, siteId, noticeText )( membershipProduct );
	} );
};
