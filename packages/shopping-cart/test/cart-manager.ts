import { createShoppingCartManagerClient, getEmptyResponseCart } from '../src/index';
import { getCart, setCart, mainCartKey, planOne, planTwo } from './utils/mock-cart-api';

/* eslint-disable jest/no-done-callback, jest/no-conditional-expect */

describe( 'ShoppingCartManager', () => {
	describe( 'getCart', () => {
		it( 'returns the responseCart', async () => {
			const cartManagerClient = createShoppingCartManagerClient( {
				getCart,
				setCart,
			} );
			const manager = cartManagerClient.forCartKey( mainCartKey );
			await manager.fetchInitialCart();
			const { responseCart } = manager.getState();
			expect( responseCart.products.length ).toBe( 0 );
			expect( responseCart.cart_key ).toBe( mainCartKey );
		} );

		it( 'returns an empty cart if fetchInitialCart has not been called', async () => {
			const cartManagerClient = createShoppingCartManagerClient( {
				getCart,
				setCart,
			} );
			const manager = cartManagerClient.forCartKey( mainCartKey );
			const { responseCart } = manager.getState();
			expect( responseCart.products.length ).toBe( 0 );
			expect( responseCart.cart_key ).toBe( 'no-site' );
		} );
	} );

	it( 'clearMessages removes messages from the cart', async () => {
		const mockGetCart = jest.fn().mockResolvedValue( {
			...getEmptyResponseCart(),
			messages: { errors: [ { code: 'test-error', message: 'Test Error' } ] },
		} );
		const cartManagerClient = createShoppingCartManagerClient( {
			getCart: mockGetCart,
			setCart,
		} );
		const manager = cartManagerClient.forCartKey( mainCartKey );
		try {
			await manager.fetchInitialCart();
		} catch {}
		const { responseCart: initialCart } = manager.getState();
		expect( initialCart.messages.errors.length ).toBe( 1 );
		await manager.actions.clearMessages();
		const { responseCart } = manager.getState();
		expect( responseCart.messages?.errors ?? [] ).toEqual( [] );
		expect( responseCart.messages?.success ?? [] ).toEqual( [] );
	} );

	it( 'addProductsToCart adds the products to the cart if not queued', async () => {
		const cartManagerClient = createShoppingCartManagerClient( {
			getCart,
			setCart,
		} );
		const manager = cartManagerClient.forCartKey( mainCartKey );
		await manager.fetchInitialCart();
		await manager.actions.addProductsToCart( [ planOne ] );
		const { responseCart } = manager.getState();
		expect( responseCart.products.length ).toBe( 1 );
		expect( responseCart.products[ 0 ].product_slug ).toBe( planOne.product_slug );
	} );

	it( 'addProductsToCart rejects its promise if there are error messages in the response', async () => {
		const errorCode = 'test-error';
		const errorMessage = 'test error message';
		const mockSetCart = jest.fn().mockResolvedValue( {
			...getEmptyResponseCart(),
			messages: { errors: [ { code: errorCode, message: errorMessage } ] },
		} );
		const cartManagerClient = createShoppingCartManagerClient( {
			getCart,
			setCart: mockSetCart,
		} );
		const manager = cartManagerClient.forCartKey( mainCartKey );
		await manager.fetchInitialCart();
		expect.assertions( 2 );
		return manager.actions.addProductsToCart( [ planOne ] ).catch( ( error ) => {
			expect( error.message ).toEqual( errorMessage );
			expect( error.code ).toEqual( errorCode );
		} );
	} );

	it( 'addProductsToCart rejects its promise if there is a connection error', async () => {
		const errorCode = 'SET_SERVER_CART_ERROR';
		const errorMessage = 'test error message';
		const mockSetCart = jest.fn().mockRejectedValue( { message: errorMessage } );
		const cartManagerClient = createShoppingCartManagerClient( {
			getCart,
			setCart: mockSetCart,
		} );
		const manager = cartManagerClient.forCartKey( mainCartKey );
		await manager.fetchInitialCart();
		expect.assertions( 2 );
		return manager.actions.addProductsToCart( [ planOne ] ).catch( ( error ) => {
			expect( error.message ).toEqual( errorMessage );
			expect( error.code ).toEqual( errorCode );
		} );
	} );

	it( 'addProductsToCart adds the products to the cart if queued', async () => {
		const cartManagerClient = createShoppingCartManagerClient( {
			getCart,
			setCart,
		} );
		const manager = cartManagerClient.forCartKey( mainCartKey );
		manager.fetchInitialCart();
		await manager.actions.addProductsToCart( [ planOne ] );
		const { responseCart } = manager.getState();
		expect( responseCart.products.length ).toBe( 1 );
		expect( responseCart.products[ 0 ].product_slug ).toBe( planOne.product_slug );
	} );

	it( 'addProductsToCart does nothing if passed an empty array', async () => {
		const cartManagerClient = createShoppingCartManagerClient( {
			getCart,
			setCart,
		} );
		const manager = cartManagerClient.forCartKey( mainCartKey );
		await manager.fetchInitialCart();
		await manager.actions.addProductsToCart( [] );
		const { responseCart } = manager.getState();
		expect( responseCart.products.length ).toBe( 0 );
	} );

	it( 'replaceProductsInCart does nothing if passed an empty array', async () => {
		const cartManagerClient = createShoppingCartManagerClient( {
			getCart,
			setCart,
		} );
		const manager = cartManagerClient.forCartKey( mainCartKey );
		await manager.fetchInitialCart();
		await manager.actions.replaceProductsInCart( [] );
		const { responseCart } = manager.getState();
		expect( responseCart.products.length ).toBe( 0 );
	} );

	it( 'reloadFromServer forces the cart data to be overwritten by the server copy', async () => {
		const mockGetCart = jest
			.fn()
			.mockResolvedValue( { ...getEmptyResponseCart(), products: [ planOne ] } );
		const cartManagerClient = createShoppingCartManagerClient( {
			getCart: mockGetCart,
			setCart,
		} );
		const manager = cartManagerClient.forCartKey( mainCartKey );
		await manager.fetchInitialCart();
		mockGetCart.mockResolvedValue( { ...getEmptyResponseCart(), products: [ planTwo ] } );
		await manager.actions.reloadFromServer();
		const { responseCart } = manager.getState();
		expect( responseCart.products[ 0 ].product_slug ).toBe( planTwo.product_slug );
	} );

	it( 'actions taken before calling fetchInitialCart fetch the cart anyway', async () => {
		const mockGetCart = jest
			.fn()
			.mockResolvedValue( { ...getEmptyResponseCart(), products: [ planTwo ] } );
		const cartManagerClient = createShoppingCartManagerClient( {
			getCart: mockGetCart,
			setCart,
		} );
		const manager = cartManagerClient.forCartKey( mainCartKey );
		const p1 = manager.actions.addProductsToCart( [ planOne ] );
		await p1;
		const { responseCart } = manager.getState();
		expect( responseCart.products.length ).toBe( 2 );
		const slugsInCart = responseCart.products.map( ( prod ) => prod.product_slug );
		expect( slugsInCart ).toContain( planOne.product_slug );
		expect( slugsInCart ).toContain( planTwo.product_slug );
	} );

	it( 'multiple actions triggered sequentially all modify the cart', async () => {
		const cartManagerClient = createShoppingCartManagerClient( {
			getCart,
			setCart,
		} );
		const manager = cartManagerClient.forCartKey( mainCartKey );
		manager.fetchInitialCart();
		const p1 = manager.actions.addProductsToCart( [ planOne ] );
		const p2 = manager.actions.addProductsToCart( [ planTwo ] );
		const p3 = manager.actions.applyCoupon( 'abcd' );
		await Promise.all( [ p1, p2, p3 ] );
		const { responseCart } = manager.getState();
		expect( responseCart.products.length ).toBe( 2 );
		expect( responseCart.products[ 0 ].product_slug ).toBe( planOne.product_slug );
		expect( responseCart.products[ 1 ].product_slug ).toBe( planTwo.product_slug );
		expect( responseCart.coupon ).toBe( 'abcd' );
	} );

	it( 'multiple actions only trigger one server sync', async () => {
		const setCartSpy = jest.fn().mockImplementation( setCart );
		const cartManagerClient = createShoppingCartManagerClient( {
			getCart,
			setCart: setCartSpy,
		} );
		const manager = cartManagerClient.forCartKey( mainCartKey );
		manager.fetchInitialCart();
		const p1 = manager.actions.addProductsToCart( [ planOne ] );
		const p2 = manager.actions.addProductsToCart( [ planTwo ] );
		const p3 = manager.actions.applyCoupon( 'abcd' );
		await Promise.all( [ p1, p2, p3 ] );
		expect( setCartSpy ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'resolves action promises which do not modify the cart when other actions resolve', async () => {
		const cartManagerClient = createShoppingCartManagerClient( {
			getCart,
			setCart,
		} );
		const manager = cartManagerClient.forCartKey( mainCartKey );
		const p1 = manager.fetchInitialCart();
		const p2 = manager.actions.removeCoupon();
		const completeCart = await p2;
		return expect( p1 ).resolves.toEqual( completeCart );
	} );

	it( 'resolves action promises which do not modify the cart when there are no pending actions', async () => {
		const cartManagerClient = createShoppingCartManagerClient( {
			getCart,
			setCart,
		} );
		const manager = cartManagerClient.forCartKey( mainCartKey );
		const p1 = await manager.fetchInitialCart();
		const p2 = await manager.actions.removeCoupon();
		expect( p1 ).toEqual( p2 );
	} );

	it( 'queues actions that occur while the initial cart is loading and plays them when the cart has loaded', ( done ) => {
		const setCartSpy = jest.fn().mockImplementation( setCart );
		const cartManagerClient = createShoppingCartManagerClient( {
			getCart,
			setCart: setCartSpy,
		} );
		const manager = cartManagerClient.forCartKey( mainCartKey );

		const subscriberCallback = () => {
			const state = manager.getState();
			if ( ! state.isLoading && ! state.isPendingUpdate ) {
				try {
					expect( state.responseCart.products.map( ( prod ) => prod.product_slug ) ).toContain(
						planOne.product_slug
					);
					done();
				} catch ( error ) {
					done( error );
				}
			}
		};
		manager.subscribe( subscriberCallback );

		// Trigger the initial fetch; this is async
		manager.fetchInitialCart();
		// While the fetch is still in-progress, trigger an action
		manager.actions.addProductsToCart( [ planOne ] );
	} );

	it( 'queues actions that occur after initial cart has loaded when queued actions remain and plays them when the cart is loaded', ( done ) => {
		const setCartSpy = jest.fn().mockImplementation( setCart );
		const cartManagerClient = createShoppingCartManagerClient( {
			getCart,
			setCart: setCartSpy,
		} );
		const manager = cartManagerClient.forCartKey( mainCartKey );

		let hasAddedSecondProduct = false;
		const subscriberCallback = () => {
			const state = manager.getState();
			if ( ! state.isLoading && ! hasAddedSecondProduct ) {
				hasAddedSecondProduct = true;
				manager.actions.addProductsToCart( [ planTwo ] );
			}

			if ( ! state.isLoading && ! state.isPendingUpdate ) {
				try {
					const slugsInCart = state.responseCart.products.map( ( prod ) => prod.product_slug );
					expect( slugsInCart ).toContain( planOne.product_slug );
					expect( slugsInCart ).toContain( planTwo.product_slug );
					done();
				} catch ( err ) {
					done( err );
				}
			}
		};

		manager.subscribe( subscriberCallback );
		manager.fetchInitialCart();
		manager.actions.addProductsToCart( [ planOne ] );
	} );
} );
