// TODO: whenever it's possible, change to rely on the stored data under
// products and coupons instead of accumulating duplicate state here.
// It would be best to do this after further updates to the data layer.

/**
 * External dependencies
 */
import { fill, find, findIndex } from 'lodash';

/**
 * Internal dependencies
 */
import { withoutPersistence } from 'state/utils';
import {
	WOOCOMMERCE_COUPON_DELETED,
	WOOCOMMERCE_COUPON_UPDATED,
	WOOCOMMERCE_COUPONS_UPDATED,
	WOOCOMMERCE_PRODUCT_UPDATED,
	WOOCOMMERCE_PRODUCT_VARIATION_UPDATED,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';
import { createPromotionFromProduct, createPromotionFromCoupon } from './helpers';

const initialState = {
	coupons: null,
	products: null,
	productVariations: null,
	promotions: null,
};

export default withoutPersistence( ( state = initialState, action ) => {
	switch ( action.type ) {
		case WOOCOMMERCE_COUPON_DELETED:
			return couponDeleted( state, action );
		case WOOCOMMERCE_COUPON_UPDATED:
			return couponUpdated( state, action );
		case WOOCOMMERCE_COUPONS_UPDATED:
			return couponsUpdated( state, action );
		case WOOCOMMERCE_PRODUCT_UPDATED:
			return productUpdated( state, action );
		case WOOCOMMERCE_PRODUCT_VARIATION_UPDATED:
			return productVariationUpdated( state, action );
		case WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS:
			return productsRequestSuccess( state, action );
	}

	return state;
} );

function couponDeleted( state, action ) {
	const { couponId } = action;
	const { coupons } = state;

	const newCoupons = coupons.filter( ( coupon ) => couponId !== coupon.id );

	if ( newCoupons.length !== coupons.length ) {
		const promotions = calculatePromotions( newCoupons, state.products, state.productVariations );

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
		const promotions = calculatePromotions( newCoupons, state.products, state.productVariations );

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

		const promotions = calculatePromotions( newCoupons, state.products, state.productVariations );
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
		const promotions = calculatePromotions( state.coupons, newProducts, state.productVariations );

		return { ...state, products: newProducts, promotions };
	}
	return state;
}

// TODO: Update this for performance if needed. As-is, it will cause frequent recalculations.
function productVariationUpdated( state, action ) {
	const { data: productVariation, productId } = action;
	const productVariations = state.productVariations || [];
	const index = findIndex( productVariations, { id: productVariation.id } );

	const newProductVariation = { ...productVariation, productId };
	const newProductVariations = [ ...productVariations ];

	if ( -1 < index ) {
		newProductVariations[ index ] = newProductVariation;
	} else {
		newProductVariations.push( newProductVariation );
	}

	const promotions = calculatePromotions( state.coupons, state.products, newProductVariations );

	return { ...state, productVariations: newProductVariations, promotions };
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

		const promotions = calculatePromotions( state.coupons, newProducts, state.productVariations );
		return { ...state, products: newProducts, promotions };
	}

	return state;
}

function calculatePromotions( coupons, products, productVariations ) {
	// Only calculate if coupons and products are all loaded.
	if ( coupons && products && -1 === coupons.indexOf( null ) && -1 === products.indexOf( null ) ) {
		const saleProducts = products.filter( ( product ) => '' !== product.sale_price );
		const saleVariations = ( productVariations || [] ).filter(
			( variation ) => '' !== variation.sale_price
		);

		const productPromotions = saleProducts.map( createPromotionFromProduct );
		const variationPromotions = saleVariations.map( ( variation ) => {
			const product = find( products, { id: variation.productId } );
			return createPromotionFromProduct( { ...variation, name: product.name } );
		} );
		const couponPromotions = coupons.map( createPromotionFromCoupon );

		const promotions = [ ...productPromotions, ...variationPromotions, ...couponPromotions ].sort(
			comparePromotions
		);

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
