import '@automattic/calypso-polyfills';
/**
 * Internal dependencies
 */
import { RequestCart, ResponseCart } from '../types';
/**
 * A fake WPCOM shopping cart endpoint.
 */
export declare function mockSetCartEndpoint( {
	products: requestProducts,
	currency: requestCurrency,
	coupon: requestCoupon,
	locale: requestLocale,
}: RequestCart ): Promise< ResponseCart >;
export declare function mockGetCartEndpointWith(
	initialCart: ResponseCart
): ( string: any ) => Promise< ResponseCart >;
