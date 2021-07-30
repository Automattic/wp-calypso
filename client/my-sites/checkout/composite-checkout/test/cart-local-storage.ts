/**
 * @jest-environment jsdom
 */
/**
 * Internal dependencies
 */
import {
	getCartFromLocalStorage,
	saveCartItemsToLocalStorage,
	addCartItemsToLocalStorage,
	clearCartFromLocalStorage,
} from '../lib/cart-local-storage';

const mockWindowProperty = ( property, value ) => {
	const { [ property ]: originalProperty } = window;
	delete window[ property ];
	beforeAll( () => {
		Object.defineProperty( window, property, {
			configurable: true,
			writable: true,
			value,
		} );
	} );
	afterAll( () => {
		window[ property ] = originalProperty;
	} );
};

const localStorageTable = [
	[ 'working', true ],
	[ 'not working', false ],
];

describe.each( localStorageTable )(
	'cart-local-storage when localStorage is %s',
	( _, isLocalStorageWorking ) => {
		beforeEach( () => {
			clearCartFromLocalStorage();
		} );

		if ( ! isLocalStorageWorking ) {
			mockWindowProperty( 'localStorage', {
				setItem: jest.fn(),
				getItem: jest.fn(),
				removeItem: jest.fn(),
			} );
		}

		describe( 'getCartFromLocalStorage', () => {
			it( 'returns an empty array when no data is saved', () => {
				expect( getCartFromLocalStorage() ).toEqual( [] );
			} );

			it( 'returns saved products when products are saved', () => {
				const expected = [ { product_slug: 'test-product' }, { product_slug: 'other-product' } ];
				saveCartItemsToLocalStorage( expected );
				expect( getCartFromLocalStorage() ).toEqual( expected );
			} );
		} );

		describe( 'addCartItemsToLocalStorage', () => {
			it( 'returns saved products and existing products when products are added', () => {
				const existingProducts = [
					{ product_slug: 'test-product' },
					{ product_slug: 'other-product' },
				];
				const newProducts = [ { product_slug: 'test-product-2' } ];
				saveCartItemsToLocalStorage( existingProducts );
				addCartItemsToLocalStorage( newProducts );
				expect( getCartFromLocalStorage() ).toEqual( [ ...existingProducts, ...newProducts ] );
			} );
		} );

		describe( 'clearCartFromLocalStorage', () => {
			it( 'deletes saved products when products are saved', () => {
				const existingProducts = [
					{ product_slug: 'test-product' },
					{ product_slug: 'other-product' },
				];
				saveCartItemsToLocalStorage( existingProducts );
				clearCartFromLocalStorage();
				expect( getCartFromLocalStorage() ).toEqual( [] );
			} );
		} );
	}
);
