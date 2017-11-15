/**
 * External dependencies
 *
 * @format
 */

import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	fetchCoupons,
	createCoupon,
	updateCoupon,
	deleteCoupon,
} from 'woocommerce/state/sites/coupons/actions';
import {
	updateProduct,
} from 'woocommerce/state/sites/products/actions';
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

	if ( 'coupon' === promotion.type && promotion.coupon ) {
		dispatch( createCoupon( siteId, promotion.coupon, action.successAction, action.failureAction ) );
	}
	if ( 'product_sale' === promotion.type && promotion.product ) {
		dispatch( updateProduct( siteId, promotion.product, action.successAction, action.failureAction ) );
	}
}

export function promotionUpdate( { dispatch }, action ) {
	const { siteId, promotion } = action;

	if ( 'coupon' === promotion.type && promotion.coupon ) {
		dispatch( updateCoupon( siteId, promotion.coupon, action.successAction, action.failureAction ) );
	}
	if ( 'product_sale' === promotion.type && promotion.product ) {
		dispatch( updateProduct( siteId, promotion.product, action.successAction, action.failureAction ) );
	}
}

export function promotionDelete( { dispatch }, action ) {
	const { siteId, promotion } = action;

	if ( 'coupon' === promotion.type && promotion.coupon ) {
		dispatch( deleteCoupon( siteId, promotion.coupon.id, action.successAction, action.failureAction ) );
	}
	if ( 'product_sale' === promotion.type && promotion.product ) {
		// Remove all sale-related fields from the product.
		const {
			sale_price,
			date_on_sale_from,
			date_on_sale_from_gmt,
			date_on_sale_to,
			date_on_sale_to_gmt,
			...productDeletedSale
		} = promotion.product; // eslint-disable-line no-unused-vars

		dispatch( updateProduct( siteId, productDeletedSale, action.successAction, action.failureAction ) );
	}
}

