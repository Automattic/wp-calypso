import { createShoppingCartManagerClient } from '../src/index';
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
	} );

	describe( 'actions', () => {
		it( 'addProductsToCart adds the products to the cart', async () => {
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

		it( 'multiple actions all modify the cart', async () => {
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
				manager.actions.addProductsToCart( [ planTwo ] );
				hasAddedSecondProduct = true;
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
