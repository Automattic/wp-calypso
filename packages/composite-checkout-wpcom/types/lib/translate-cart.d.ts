/**
 * Internal dependencies
 */
import { ResponseCart, WPCOMCart } from '../types';
/**
 * Translate a cart object as returned by the WPCOM cart endpoint to
 * the format required by the composite checkout component.
 *
 * @param serverCart Cart object returned by the WPCOM cart endpoint
 * @returns Cart object suitable for passing to the checkout component
 */
export declare function translateWpcomCartToCheckoutCart( serverCart: ResponseCart ): WPCOMCart;
