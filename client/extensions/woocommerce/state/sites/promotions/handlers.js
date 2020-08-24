/**
 * External dependencies
 */

import debugFactory from 'debug';
import { isNumber, isUndefined } from 'lodash';

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
import { fetchProducts, updateProduct } from 'woocommerce/state/sites/products/actions';
import {
	fetchProductVariations,
	updateProductVariation,
} from 'woocommerce/state/sites/product-variations/actions';
import {
	WOOCOMMERCE_COUPONS_UPDATED,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
	WOOCOMMERCE_PROMOTION_CREATE,
	WOOCOMMERCE_PROMOTION_DELETE,
	WOOCOMMERCE_PROMOTION_UPDATE,
	WOOCOMMERCE_PROMOTIONS_REQUEST,
} from 'woocommerce/state/action-types';

const debug = debugFactory( 'woocommerce:promotions' );

// How many products to load per page at a time.
// TODO: Remove this once we have a Promotions API.
const itemsPerPage = 30;

export default {
	[ WOOCOMMERCE_COUPONS_UPDATED ]: [ couponsUpdated ],
	[ WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS ]: [ productsReceived ],
	[ WOOCOMMERCE_PROMOTION_CREATE ]: [ promotionCreate ],
	[ WOOCOMMERCE_PROMOTION_DELETE ]: [ promotionDelete ],
	[ WOOCOMMERCE_PROMOTION_UPDATE ]: [ promotionUpdate ],
	[ WOOCOMMERCE_PROMOTIONS_REQUEST ]: [ promotionsRequest ],
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

export function productsReceived( { dispatch }, action ) {
	const { siteId, params, products } = action;

	// For each variable product, fetch its variations, too.
	if ( isUndefined( params.offset ) && products ) {
		products.forEach( ( product ) => {
			if ( product.variations && product.variations.length > 0 ) {
				dispatch( fetchProductVariations( siteId, product.id ) );
			}
		} );
	}
}

export function couponsUpdated( { dispatch }, action ) {
	const { siteId, coupons, params, totalCoupons } = action;

	if ( undefined !== params.offset ) {
		debug(
			`Coupons ${ params.offset + 1 }-${
				params.offset + coupons.length
			} out of ${ totalCoupons } received.`
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
			updateProductSale( dispatch, siteId, promotion, action.successAction, action.failureAction );
			break;
		case 'fixed_cart':
		case 'fixed_product':
		case 'percent':
		case 'free_shipping':
			const coupon = createCouponUpdateFromPromotion( promotion );
			dispatch( createCoupon( siteId, coupon, action.successAction, action.failureAction ) );
			break;
	}
}

export function promotionUpdate( { dispatch }, action ) {
	const { siteId, promotion } = action;

	switch ( promotion.type ) {
		case 'product_sale':
			updateProductSale( dispatch, siteId, promotion, action.successAction, action.failureAction );
			break;
		case 'fixed_cart':
		case 'fixed_product':
		case 'percent':
		case 'free_shipping':
			const coupon = createCouponUpdateFromPromotion( promotion );
			dispatch( updateCoupon( siteId, coupon, action.successAction, action.failureAction ) );
			break;
	}
}

export function promotionDelete( { dispatch }, action ) {
	const { siteId, promotion } = action;

	switch ( promotion.type ) {
		case 'product_sale':
			clearProductSale( dispatch, siteId, promotion, action.successAction, action.failureAction );
			break;
		case 'fixed_cart':
		case 'fixed_product':
		case 'percent':
		case 'free_shipping':
			dispatch(
				deleteCoupon( siteId, promotion.couponId, action.successAction, action.failureAction )
			);
			break;
	}
}

function updateProductSale( dispatch, siteId, promotion, successAction, failureAction ) {
	const { parentId } = promotion;
	const data = createProductUpdateFromPromotion( promotion );

	if ( data.id !== promotion.productId && isNumber( promotion.productId ) ) {
		clearProductSale( dispatch, siteId, promotion, null, failureAction );
	}

	if ( parentId ) {
		dispatch( updateProductVariation( siteId, parentId, data, successAction, failureAction ) );
	} else {
		dispatch( updateProduct( siteId, data, successAction, failureAction ) );
	}
}

function clearProductSale( dispatch, siteId, promotion, successAction, failureAction ) {
	const { parentId, productId } = promotion;

	const data = {
		id: productId,
		sale_price: '',
		date_on_sale_from: null,
		date_on_sale_to: null,
	};

	if ( parentId ) {
		dispatch( updateProductVariation( siteId, productId, data, successAction, failureAction ) );
	} else {
		dispatch( updateProduct( siteId, data, successAction, failureAction ) );
	}
}
