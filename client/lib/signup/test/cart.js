/**
 * Internal dependencies
 */
import SignupCart from '../cart';
import wp from 'calypso/lib/wp';
import { getEmptyResponseCart, convertResponseCartToRequestCart } from '@automattic/shopping-cart';

jest.mock( 'calypso/lib/wp' );

const mockCart = {
	...getEmptyResponseCart(),
	cart_key: 'original_key',
	products: [ { product_id: 25, product_slug: 'something_original' } ],
};
const setCart = jest.fn().mockImplementation( ( cart_key, value, callback ) => callback() );
const getCart = jest
	.fn()
	.mockImplementation( ( cart_key, callback ) => callback( null, { ...mockCart, cart_key } ) );
const undocumentedFunctions = {
	setCart,
	getCart,
};
wp.undocumented = jest.fn().mockReturnValue( undocumentedFunctions );

describe( 'SignupCart', () => {
	describe( 'createCart', () => {
		beforeEach( () => {
			setCart.mockClear();
			getCart.mockClear();
		} );

		it( 'sends a basic cart for the cart key to the cart endpoint', () => {
			const cartKey = '1234abcd';
			const productsToAdd = [];
			const callback = () => {};
			SignupCart.createCart( cartKey, productsToAdd, callback );

			const expectedCart = convertResponseCartToRequestCart( {
				...getEmptyResponseCart(),
				cart_key: cartKey,
				products: productsToAdd,
			} );
			expect( setCart ).toHaveBeenCalledWith( cartKey, expectedCart, expect.anything() );
		} );

		it( 'sends a cart with the passed-in products to the cart endpoint', () => {
			const cartKey = '1234abcd';
			const productsToAdd = [ { product_id: 1003, product_slug: 'plan' } ];
			const callback = () => {};
			SignupCart.createCart( cartKey, productsToAdd, callback );

			const expectedCart = convertResponseCartToRequestCart( {
				...getEmptyResponseCart(),
				cart_key: cartKey,
				products: productsToAdd,
			} );
			expect( setCart ).toHaveBeenCalledWith( cartKey, expectedCart, expect.anything() );
		} );

		it( 'calls the callback when the cart creation completes', () => {
			const cartKey = '1234abcd';
			const productsToAdd = [ { product_id: 1003, product_slug: 'plan' } ];
			const callback = jest.fn();
			SignupCart.createCart( cartKey, productsToAdd, callback );

			expect( callback ).toHaveBeenCalled();
		} );
	} );

	describe( 'addToCart', () => {
		beforeEach( () => {
			setCart.mockClear();
			getCart.mockClear();
		} );

		it( 'fetches the cart from the server and then sends a cart with passed-in products appended to the endpoint', () => {
			const cartKey = '1234abcd';
			const productsToAdd = [ { product_id: 1003, product_slug: 'plan' } ];
			const callback = jest.fn();
			SignupCart.addToCart( cartKey, productsToAdd, callback );

			const expectedCart = convertResponseCartToRequestCart( {
				...getEmptyResponseCart(),
				cart_key: cartKey,
				products: [ ...mockCart.products, ...productsToAdd ],
			} );
			expect( setCart ).toHaveBeenCalledWith( cartKey, expectedCart, callback );
		} );
	} );
} );
