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
				if ( noticeText ) {
					dispatch(
						successNotice( noticeText, {
							duration: 5000,
						} )
					);
				}
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
				if ( noticeText ) {
					dispatch(
						successNotice( noticeText, {
							duration: 5000,
						} )
					);
				}
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

export const requestDeleteProduct = (
	siteId,
	product,
	annualProduct,
	noticeText,
	cancelSubscriptions
) => {
	return ( dispatch ) => {
		dispatch( {
			type: MEMBERSHIPS_PRODUCT_DELETE,
			siteId,
			product,
		} );

		if ( annualProduct ) {
			dispatch( {
				type: MEMBERSHIPS_PRODUCT_DELETE,
				siteId,
				product: annualProduct,
			} );
		}

		const requests = [
			wpcom.req.post(
				{
					method: 'DELETE',
					path: `/sites/${ siteId }/memberships/product/${ product.ID }`,
					apiNamespace: 'wpcom/v2',
				},
				{
					cancel_subscriptions: Boolean( cancelSubscriptions ),
				}
			),
		];

		if ( annualProduct ) {
			requests.push(
				wpcom.req.post(
					{
						method: 'DELETE',
						path: `/sites/${ siteId }/memberships/product/${ annualProduct.ID }`,
						apiNamespace: 'wpcom/v2',
					},
					{
						cancel_subscriptions: Boolean( cancelSubscriptions ),
					}
				)
			);
		}

		return Promise.all( requests )
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
				if ( annualProduct ) {
					dispatch( {
						type: MEMBERSHIPS_PRODUCT_DELETE_FAILURE,
						siteId,
						error,
						product: annualProduct,
					} );
				}
				dispatch(
					errorNotice( error.message, {
						duration: 10000,
					} )
				);
			} );
	};
};

const addOrUpdateAnnualProduct = ( siteId, annualProduct, noticeText ) => ( membershipProduct ) => {
	const newMembershipProductId = membershipProduct.ID;
	annualProduct.tier = newMembershipProductId;
	if ( annualProduct.ID ) {
		return requestUpdateProduct( siteId, annualProduct, noticeText );
	}
	return requestAddProduct( siteId, annualProduct, noticeText );
};

export const requestAddTier = ( siteId, product, annualProduct, noticeText ) => {
	return ( dispatch ) =>
		requestAddProduct(
			siteId,
			product,
			null // We don't want to show a message when adding the first product
		)( dispatch ).then( ( membershipProduct ) => {
			addOrUpdateAnnualProduct( siteId, annualProduct, noticeText )( membershipProduct )(
				dispatch
			);
		} );
};

export const requestUpdateTier = ( siteId, product, annualProduct, noticeText ) => {
	return ( dispatch ) => {
		return requestUpdateProduct(
			siteId,
			product,
			null // We don't want to show a message on the first product update
		)( dispatch ).then( ( membershipProduct ) => {
			// The annual product does not exist yet
			return addOrUpdateAnnualProduct( siteId, annualProduct, noticeText )( membershipProduct )(
				dispatch
			);
		} );
	};
};
