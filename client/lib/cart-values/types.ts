/**
 * Internal dependencies
 */
import {
	ResponseCart,
	ResponseCartProduct,
	ResponseCartProductExtra,
} from 'calypso/my-sites/checkout/composite-checkout/hooks/use-shopping-cart-manager/types';

export type CartItemValue = ResponseCartProduct;

export type CartItemExtra = ResponseCartProductExtra;

export type CartValue = ResponseCart;
