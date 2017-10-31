/**
 * External dependencies
 *
 * @format
 */

import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { createProductUpdateFromPromotion, createCouponUpdateFromPromotion } from './helpers';
import {
	fetchCoupons,
	createCoupon,
	updateCoupon,
	deleteCoupon,
} from 'woocommerce/state/sites/coupons/actions';
import { updateProduct } from 'woocommerce/state/sites/products/actions';
import { fetchProducts } from 'woocommerce/state/sites/products/actions';
import {
	WOOCOMMERCE_PROMOTION_CREATE,
	WOOCOMMERCE_PROMOTION_UPDATE,
	WOOCOMMERCE_PROMOTION_DELETE,
	WOOCOMMERCE_PROMOTIONS_REQUEST,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
	WOOCOMMERCE_COUPONS_UPDATED,
} from 'woocommerce/state/action-types';

const debug = debugFactory( 'woocommerce:promotions' );

// How many products to load per page at a time.
// TODO: Remove this once we have a Promotions API.
const itemsPerPage = 30;

export default {
	[ WOOCOMMERCE_PROMOTION_CREATE ]: [ promotionCreate ],
	[ WOOCOMMERCE_PROMOTION_UPDATE ]: [ promotionUpdate ],
	[ WOOCOMMERCE_PROMOTION_DELETE ]: [ promotionDelete ],
	[ WOOCOMMERCE_PROMOTIONS_REQUEST ]: [ promotionsRequest ],
	[ WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS ]: [ productsRequestSuccess ],
	[ WOOCOMMERCE_COUPONS_UPDATED ]: [ couponsUpdated ],
};

export function promotionsRequest( { dispatch }, action ) {
	const { siteId } = action;
	const perPage = action.perPage || itemsPerPage;

	// To get the list of promotions, we have to merge the list of
	// products that are "on sale" and all coupons, and sort them
	// by expiration date. The WooCommerce API doesn't support ordering
	// by expiration date, so for now, we have to get the entire lists
	// and sort them ourselves.
	//
	// In the future, we will either modify the API to support sorting this way,
	// or even better, create a Promotions API to handle this on the server.
	//
	// TODO: Update after API support changes, one way or the other.

	// Have to fetch all products, because we need not just the ones on sale,
	// but the ones who have sale dates which are expired or still to come.
	dispatch( fetchProducts( siteId, { offset: 0, per_page: perPage } ) );

	// Fetch all coupons as well.
	dispatch( fetchCoupons( siteId, { offset: 0, per_page: perPage } ) );
}

export function productsRequestSuccess( { dispatch }, action ) {
	const { siteId, products, params, totalProducts } = action;

	if ( undefined !== params.offset ) {
		debug(
			`Products ${ params.offset + 1 }-${ params.offset +
				products.length } out of ${ totalProducts } received.`
		);

		const remainder = totalProducts - params.offset - products.length;
		if ( remainder ) {
			const offset = params.offset + products.length;
			dispatch( fetchProducts( siteId, { offset, per_page: params.per_page } ) );
		}
	}
}

export function couponsUpdated( { dispatch }, action ) {
	const { siteId, coupons, params, totalCoupons } = action;

	if ( undefined !== params.offset ) {
		debug(
			`Coupons ${ params.offset + 1 }-${ params.offset +
				coupons.length } out of ${ totalCoupons } received.`
		);

		const remainder = totalCoupons - params.offset - coupons.length;
		if ( 0 < remainder ) {
			const offset = params.offset + coupons.length;
			dispatch( fetchCoupons( siteId, { offset, per_page: params.per_page } ) );
		}
	}
}

export function promotionCreate( { dispatch }, action ) {
	const { siteId, promotion } = action;

	switch ( promotion.type ) {
		case 'product_sale':
			const product = createProductUpdateFromPromotion( promotion );
			dispatch( updateProduct( siteId, product, action.successAction, action.failureAction ) );
			break;
		case 'fixed_cart':
		case 'fixed_product':
		case 'percent':
			const coupon = createCouponUpdateFromPromotion( promotion );
			dispatch( createCoupon( siteId, coupon, action.successAction, action.failureAction ) );
			break;
	}
}

export function promotionUpdate( { dispatch }, action ) {
	const { siteId, promotion } = action;

	switch ( promotion.type ) {
		case 'product_sale':
			const product = createProductUpdateFromPromotion( promotion );
			if ( product.id !== promotion.productId ) {
				// This product sale is changing product, so remove it from the previous one.
				dispatch( clearProductSale( siteId, promotion.productId, null, action.failureAction ) );
			}
			dispatch( updateProduct( siteId, product, action.successAction, action.failureAction ) );
			break;
		case 'fixed_cart':
		case 'fixed_product':
		case 'percent':
			const coupon = createCouponUpdateFromPromotion( promotion );
			dispatch( updateCoupon( siteId, coupon, action.successAction, action.failureAction ) );
			break;
	}
}

export function promotionDelete( { dispatch }, action ) {
	const { siteId, promotion } = action;

	switch ( promotion.type ) {
		case 'product_sale':
			dispatch(
				clearProductSale( siteId, promotion.productId, action.successAction, action.failureAction )
			);
			break;
		case 'fixed_cart':
		case 'fixed_product':
		case 'percent':
			dispatch(
				deleteCoupon( siteId, promotion.couponId, action.successAction, action.failureAction )
			);
			break;
	}
}

function clearProductSale( siteId, productId, successAction, failureAction ) {
	const productUpdateData = {
		id: productId,
		sale_price: '',
		date_on_sale_from: null,
		date_on_sale_to: null,
	};

	return updateProduct( siteId, productUpdateData, successAction, failureAction );
}
