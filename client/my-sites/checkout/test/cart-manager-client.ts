import { fetchShoppingCart } from '@automattic/api-core';
import { getEmptyResponseCart } from '@automattic/shopping-cart';
import { cartManagerClient } from '../cart-manager-client';
import { earlyRequestKeys, resetEarlyRequests, startEarlyRequest } from '../src/lib/early-requests';
import type { CartKey, ResponseCart } from '@automattic/shopping-cart';

jest.mock( '@automattic/api-core', () => ( {
	...jest.requireActual( '@automattic/api-core' ),
	fetchShoppingCart: jest.fn(),
} ) );

const cartFor = ( cartKey: CartKey ): ResponseCart => ( {
	...getEmptyResponseCart(),
	cart_key: cartKey,
} );

describe( 'cartManagerClient', () => {
	beforeEach( () => {
		resetEarlyRequests();
		jest.mocked( fetchShoppingCart ).mockReset();
		jest
			.mocked( fetchShoppingCart )
			.mockImplementation( ( cartKey ) => Promise.resolve( cartFor( cartKey ) ) );
	} );

	it( 'uses the cart the checkout route asked for by site slug when it is the cart of the site', async () => {
		startEarlyRequest( earlyRequestKeys.cart, () => Promise.resolve( cartFor( 101 ) ) );

		const cart = await cartManagerClient.forCartKey( 101 ).fetchInitialCart();

		expect( cart.cart_key ).toBe( 101 );
		expect( fetchShoppingCart ).not.toHaveBeenCalled();
	} );

	it( 'fetches the cart when the one the checkout route asked for belongs to another site', async () => {
		startEarlyRequest( earlyRequestKeys.cart, () => Promise.resolve( cartFor( 999 ) ) );

		const cart = await cartManagerClient.forCartKey( 102 ).fetchInitialCart();

		expect( cart.cart_key ).toBe( 102 );
		expect( fetchShoppingCart ).toHaveBeenCalledWith( 102 );
	} );

	it( 'fetches a cart that has no site without looking at what the checkout route asked for', async () => {
		startEarlyRequest( earlyRequestKeys.cart, () => Promise.resolve( cartFor( 'no-site' ) ) );

		await cartManagerClient.forCartKey( 'no-site' ).fetchInitialCart();

		expect( fetchShoppingCart ).toHaveBeenCalledWith( 'no-site' );
	} );

	it( 'fetches the cart when the checkout route asked for none', async () => {
		await cartManagerClient.forCartKey( 103 ).fetchInitialCart();

		expect( fetchShoppingCart ).toHaveBeenCalledWith( 103 );
	} );
} );
