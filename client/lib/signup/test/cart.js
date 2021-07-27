/**
 * Internal dependencies
 */
import { createCart, addToCart } from '../cart';
import wp from 'calypso/lib/wp';
import {
	getEmptyResponseCart,
	convertResponseCartToRequestCart,
	createRequestCartProduct,
} from '@automattic/shopping-cart';

jest.mock( 'calypso/lib/wp' );

const mockCart = {
	...getEmptyResponseCart(),
	cart_key: 'original_key',
	products: [ { product_id: 25, product_slug: 'something_original' } ],
};
wp.req.get = jest.fn().mockImplementation( ( path ) => {
	return new Promise( ( resolve, reject ) => {
		const matches = /\/me\/shopping-cart\/([^/]+)/.exec( path );
		if ( matches ) {
			const cart_key = matches[ 1 ];
			resolve( { ...mockCart, cart_key } );
			return;
		}
		reject();
	} );
} );
wp.req.post = jest.fn().mockImplementation( ( path, data ) => {
	return new Promise( ( resolve, reject ) => {
		const matches = /\/me\/shopping-cart\/([^/]+)/.exec( path );
		if ( matches ) {
			const cart_key = matches[ 1 ];
			resolve( { ...data, cart_key } );
			return;
		}
		reject();
	} );
} );

function addSignupContext( product ) {
	return { ...product, extra: { ...product.extra, context: 'signup' } };
}

describe( 'SignupCart', () => {
	describe( 'createCart', () => {
		beforeEach( () => {
			wp.req.post.mockClear();
			wp.req.get.mockClear();
		} );

		it( 'sends a basic cart for the cart key to the cart endpoint', () => {
			const cartKey = '1234abcd';
			const productsToAdd = [];
			const callback = () => {};
			createCart( cartKey, productsToAdd, callback );

			const expectedCart = convertResponseCartToRequestCart( {
				...getEmptyResponseCart(),
				cart_key: cartKey,
				products: productsToAdd,
			} );
			expect( wp.req.post ).toHaveBeenCalledWith( `/me/shopping-cart/${ cartKey }`, expectedCart );
		} );

		it( 'sends a cart with the passed-in products to the cart endpoint', () => {
			const cartKey = '1234abcd';
			const productsToAdd = [ { product_id: 1003, product_slug: 'plan' } ];
			const callback = () => {};
			createCart( cartKey, productsToAdd, callback );

			const expectedCart = convertResponseCartToRequestCart( {
				...getEmptyResponseCart(),
				cart_key: cartKey,
				products: productsToAdd.map( createRequestCartProduct ).map( addSignupContext ),
			} );
			expect( wp.req.post ).toHaveBeenCalledWith( `/me/shopping-cart/${ cartKey }`, expectedCart );
		} );

		it( 'calls the callback when the cart creation completes', () => {
			return new Promise( ( resolve ) => {
				const cartKey = '1234abcd';
				const productsToAdd = [ { product_id: 1003, product_slug: 'plan' } ];
				const callback = ( error ) => {
					expect( error ).toBeUndefined();
					resolve();
				};
				createCart( cartKey, productsToAdd, callback );
			} );
		} );
	} );

	describe( 'addToCart', () => {
		beforeEach( () => {
			wp.req.post.mockClear();
			wp.req.get.mockClear();
		} );

		it( 'fetches the cart from the server and then sends a cart with passed-in products appended to the endpoint', () => {
			return new Promise( ( resolve ) => {
				const cartKey = '1234abcd';
				const productsToAdd = [ { product_id: 1003, product_slug: 'plan' } ];

				const expectedCart = convertResponseCartToRequestCart( {
					...getEmptyResponseCart(),
					cart_key: cartKey,
					products: [
						...mockCart.products,
						...productsToAdd.map( createRequestCartProduct ).map( addSignupContext ),
					],
				} );

				const callback = () => {
					expect( wp.req.post ).toHaveBeenCalledWith(
						`/me/shopping-cart/${ cartKey }`,
						expectedCart
					);
					resolve();
				};
				addToCart( cartKey, productsToAdd, callback );
			} );
		} );
	} );
} );
