import { createShoppingCartManagerClient } from '../src/index';
import { getCart, setCart, mainCartKey, planOne, planTwo } from './utils/mock-cart-api';

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

	it( 'notifies subscribers when queued actions are complete', async () => {
		const setCartSpy = jest.fn().mockImplementation( setCart );
		const cartManagerClient = createShoppingCartManagerClient( {
			getCart,
			setCart: setCartSpy,
		} );
		const manager = cartManagerClient.forCartKey( mainCartKey );
		let hasFirstCallbackBeenCalled = false;
		const firstCallback = () => {
			const state = manager.getState();
			if ( state.isLoading || hasFirstCallbackBeenCalled ) {
				return;
			}
			hasFirstCallbackBeenCalled = true;
			manager.actions.addProductsToCart( [ planTwo ] );
			manager.actions.updateLocation( {
				postalCode: '10002',
				countryCode: 'US',
				subdivisionCode: null,
			} );
		};
		let hasSecondCallbackBeenCalled = false;
		const secondCallback = () => {
			const state = manager.getState();
			if ( state.isPendingUpdate ) {
				return;
			}
			hasSecondCallbackBeenCalled = true;
		};
		manager.subscribe( firstCallback );
		manager.subscribe( secondCallback );

		manager.fetchInitialCart();
		const p1 = manager.actions.updateLocation( {
			postalCode: '10001',
			countryCode: 'US',
			subdivisionCode: null,
		} );

		await p1;

		expect( hasFirstCallbackBeenCalled ).toBeTruthy();
		expect( hasSecondCallbackBeenCalled ).toBeTruthy();
	} );
} );
