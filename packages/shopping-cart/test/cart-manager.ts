import { createShoppingCartManagerClient } from '../src/index';
import { getCart, setCart, mainCartKey, planOne } from './utils/mock-cart-api';

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
	} );
} );
