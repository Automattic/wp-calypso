/**
 * External dependencies
 *
 * @format
 */
import { fill, findIndex } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import {
	WOOCOMMERCE_COUPON_DELETED,
	WOOCOMMERCE_COUPON_UPDATED,
	WOOCOMMERCE_COUPONS_UPDATED,
	WOOCOMMERCE_PRODUCT_UPDATED,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { createPromotionFromProduct, createPromotionFromCoupon } from './helpers';

const initialState = {
	coupons: null,
	products: null,
	promotions: null,
};

export default createReducer( initialState, {
	[ WOOCOMMERCE_COUPON_DELETED ]: couponDeleted,
	[ WOOCOMMERCE_COUPON_UPDATED ]: couponUpdated,
	[ WOOCOMMERCE_COUPONS_UPDATED ]: couponsUpdated,
	[ WOOCOMMERCE_PRODUCT_UPDATED ]: productUpdated,
	[ WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS ]: productsRequestSuccess,
} );

function couponDeleted( state, action ) {
	const { couponId } = action;
	const { coupons } = state;

	const newCoupons = coupons.filter( coupon => couponId !== coupon.id );

	if ( newCoupons.length !== coupons.length ) {
		const promotions = calculatePromotions( newCoupons, state.products );

		return { ...state, coupons: newCoupons, promotions };
	}
	return state;
}

function couponUpdated( state, action ) {
	const { coupon } = action;
	const { coupons } = state;
	const index = findIndex( coupons, { id: coupon.id } );

	if ( -1 < index ) {
		const newCoupons = [ ...coupons ];
		newCoupons[ index ] = coupon;
		const promotions = calculatePromotions( newCoupons, state.products );

		return { ...state, coupons: newCoupons, promotions };
	}
	return state;
}

function couponsUpdated( state, action ) {
	const { params, totalCoupons } = action;

	if ( undefined !== params.offset ) {
		const newCoupons = fill( Array( totalCoupons ), null );

		if ( state.coupons ) {
			// Copy over existing coupons from previous state.
			for ( let i = 0; i < state.coupons.length; i++ ) {
				newCoupons[ i ] = state.coupons[ i ];
			}
		}

		// Overlay new coupons starting at offset.
		for ( let i = 0; i < action.coupons.length; i++ ) {
			newCoupons[ params.offset + i ] = action.coupons[ i ];
		}

		const promotions = calculatePromotions( newCoupons, state.products );
		return { ...state, coupons: newCoupons, promotions };
	}

	return state;
}

function productUpdated( state, action ) {
	const { data: product } = action;
	const { products } = state;
	const index = findIndex( products, { id: product.id } );

	if ( -1 < index ) {
		const newProducts = [ ...products ];
		newProducts[ index ] = product;
		const promotions = calculatePromotions( state.coupons, newProducts );

		return { ...state, products: newProducts, promotions };
	}
	return state;
}

function productsRequestSuccess( state, action ) {
	const { params, totalProducts } = action;

	if ( undefined !== params.offset ) {
		const newProducts = fill( Array( totalProducts ), null );

		if ( state.products ) {
			// Copy over existing products from previous state.
			for ( let i = 0; i < state.products.length; i++ ) {
				newProducts[ i ] = state.products[ i ];
			}
		}

		// Overlay new products starting at offset.
		for ( let i = 0; i < action.products.length; i++ ) {
			newProducts[ params.offset + i ] = action.products[ i ];
		}

		const promotions = calculatePromotions( state.coupons, newProducts );
		return { ...state, products: newProducts, promotions };
	}

	return state;
}

function calculatePromotions( coupons, products ) {
	// Only calculate if coupons and products are all loaded.
	if ( coupons && products && -1 === coupons.indexOf( null ) && -1 === products.indexOf( null ) ) {
		const saleProducts = products.filter( product => '' !== product.sale_price );

		const productPromotions = saleProducts.map( createPromotionFromProduct );
		const couponPromotions = coupons.map( createPromotionFromCoupon );

		const promotions = [ ...productPromotions, ...couponPromotions ].sort( comparePromotions );

		return promotions;
	}

	return null;
}

function comparePromotions( a, b ) {
	// Compare end dates first
	let comparison = compareDateStrings( a.endDate, b.endDate );

	if ( comparison === 0 ) {
		// If end dates are equal, compare start dates
		comparison = compareDateStrings( a.startDate, b.startDate );
	}

	return comparison;
}

function compareDateStrings( aString, bString ) {
	if ( aString && aString.length > 0 ) {
		if ( bString && bString.length > 0 ) {
			// Both are dates, earliest date goes first.
			const aDate = new Date( aString );
			const bDate = new Date( bString );
			return aDate - bDate;
		}
		// B has no date, but A does, so B goes first.
		return 1;
	}
	if ( bString && bString.length > 0 ) {
		// A has no date, but B does, so A goes first.
		return -1;
	}
	// Neither have a date, so they're equal.
	return 0;
}
