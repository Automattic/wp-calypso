/**
 * External dependencies
 */
import {
	ResponseCart,
	ResponseCartProduct,
	ResponseCartProductExtra,
} from '@automattic/shopping-cart';

// These types are deprecated. Please use types from @automattic/shopping-cart directly.

export type CartItemValue = ResponseCartProduct;

export type CartItemExtra = ResponseCartProductExtra;

export type CartValue = ResponseCart;
