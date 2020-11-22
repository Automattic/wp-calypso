// This is required to fix the "regeneratorRuntime is not defined" error
import '@automattic/calypso-polyfills';

/**
 * External dependencies
 */
import React, { useEffect, useRef } from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, act, render, waitFor, fireEvent } from '@testing-library/react';

/**
 * Internal dependencies
 */
import { useShoppingCart, ShoppingCartProvider } from '../index';
import { emptyResponseCart } from '../src/empty-carts';
import { RequestCartProduct, ResponseCartProduct, RequestCart, ResponseCart } from '../src/types';

const planOne = {
	product_name: 'WordPress.com Personal',
	product_slug: 'personal-bundle',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	free_trial: false,
	meta: '',
	product_id: 1009,
	volume: 1,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
	product_cost_integer: 14400,
	product_cost_display: 'R$144',
	item_subtotal_monthly_cost_display: 'R$144',
	item_subtotal_monthly_cost_integer: 14400,
	item_original_subtotal_integer: 14400,
	item_original_subtotal_display: 'R$144',
	is_domain_registration: false,
	is_bundled: false,
	is_sale_coupon_applied: false,
	months_per_bill_period: null,
	uuid: 'product001',
	cost: 144,
	price: 144,
	product_type: 'test',
	included_domain_purchase_amount: 0,
};

const planTwo = {
	product_name: 'WordPress.com Business',
	product_slug: 'business-bundle',
	currency: 'BRL',
	extra: {
		context: 'signup',
	},
	free_trial: false,
	meta: '',
	product_id: 1010,
	volume: 1,
	item_original_cost_integer: 14400,
	item_original_cost_display: 'R$144',
	item_subtotal_integer: 14400,
	item_subtotal_display: 'R$144',
	product_cost_integer: 14400,
	product_cost_display: 'R$144',
	item_subtotal_monthly_cost_display: 'R$144',
	item_subtotal_monthly_cost_integer: 14400,
	item_original_subtotal_integer: 14400,
	item_original_subtotal_display: 'R$144',
	is_domain_registration: false,
	is_bundled: false,
	is_sale_coupon_applied: false,
	months_per_bill_period: null,
	uuid: 'product002',
	cost: 144,
	price: 144,
	product_type: 'test',
	included_domain_purchase_amount: 0,
};

const mainCartKey = '1';

async function getCart( cartKey: string ) {
	if ( cartKey === mainCartKey ) {
		return emptyResponseCart;
	}
	throw new Error( 'Unknown cart key' );
}

function createProduct( productProps: RequestCartProduct ): ResponseCartProduct {
	switch ( productProps.product_id ) {
		case 1009:
			return planOne;
		case 1010:
			return planTwo;
	}
	throw new Error( 'Unknown product' );
}

async function setCart( cartKey: string, newCart: RequestCart ): Promise< ResponseCart > {
	if ( cartKey === mainCartKey ) {
		return { ...emptyResponseCart, products: newCart.products.map( createProduct ) };
	}
	throw new Error( 'Unknown cart key' );
}

function ProductList( { initialProducts }: { initialProducts?: RequestCartProduct[] } ) {
	const { responseCart, addProductsToCart } = useShoppingCart();
	const hasAdded = useRef( false );
	useEffect( () => {
		if ( initialProducts && ! hasAdded.current ) {
			hasAdded.current = true;
			addProductsToCart( initialProducts );
		}
	}, [ addProductsToCart, initialProducts ] );
	if ( responseCart.products.length === 0 ) {
		return null;
	}
	return (
		<ul data-testid="product-list">
			{ responseCart.products.map( ( product ) => {
				return <li key={ product.uuid }>{ product.product_name }</li>;
			} ) }
		</ul>
	);
}

function MockProvider( { children } ) {
	return (
		<ShoppingCartProvider cartKey={ mainCartKey } getCart={ getCart } setCart={ setCart }>
			{ children }
		</ShoppingCartProvider>
	);
}

describe( 'useShoppingCart', () => {
	const markUpdateComplete = jest.fn();

	beforeEach( () => {
		markUpdateComplete.mockClear();
	} );

	describe( 'addProductsToCart', () => {
		const TestComponent = () => {
			const { addProductsToCart } = useShoppingCart();
			const onClick = () => {
				addProductsToCart( [ planOne ] ).then( () => markUpdateComplete() );
			};
			return (
				<div>
					<ProductList />
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		it( 'adds a product to the cart', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planOne.product_name );
		} );

		it( 'returns a Promise that resolves after the update completes', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);
			fireEvent.click( screen.getByText( 'Click me' ) );
			expect( markUpdateComplete ).not.toHaveBeenCalled();
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( markUpdateComplete ).toHaveBeenCalled();
		} );
	} );

	describe( 'removeProductFromCart', () => {
		const TestComponent = () => {
			const { removeProductFromCart, responseCart } = useShoppingCart();
			const onClick = () => {
				const uuid = responseCart.products.length ? responseCart.products[ 0 ].uuid : null;
				if ( uuid ) {
					removeProductFromCart( uuid ).then( () => markUpdateComplete() );
				}
			};
			return (
				<div>
					<ProductList initialProducts={ [ planOne ] } />
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		it( 'removes a product from the cart', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByText( planOne.product_name ) ).toBeInTheDocument();
			await act( async () => {
				fireEvent.click( screen.getByText( 'Click me' ) );
			} );
			expect( screen.queryByText( planOne.product_name ) ).not.toBeInTheDocument();
		} );

		it( 'returns a Promise that resolves after the update completes', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByText( planOne.product_name ) ).toBeInTheDocument();
			await act( async () => {
				fireEvent.click( screen.getByText( 'Click me' ) );
				expect( markUpdateComplete ).not.toHaveBeenCalled();
			} );
			expect( markUpdateComplete ).toHaveBeenCalled();
		} );
	} );

	describe( 'replaceProductsInCart', () => {
		const TestComponent = () => {
			const { replaceProductsInCart } = useShoppingCart();
			const onClick = () => {
				replaceProductsInCart( [ planTwo ] ).then( () => markUpdateComplete() );
			};
			return (
				<div>
					<ProductList initialProducts={ [ planOne ] } />
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		it( 'replaces a product in the cart', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);
			await waitFor( () => screen.getByTestId( 'product-list' ) );
			expect( screen.getByText( planOne.product_name ) ).toBeInTheDocument();
			await act( async () => {
				fireEvent.click( screen.getByText( 'Click me' ) );
			} );
			expect( screen.queryByText( planOne.product_name ) ).not.toBeInTheDocument();
			expect( screen.getByText( planTwo.product_name ) ).toBeInTheDocument();
		} );

		it( 'returns a Promise that resolves after the update completes', async () => {
			render(
				<MockProvider>
					<TestComponent />
				</MockProvider>
			);

			await waitFor( () => screen.getByTestId( 'product-list' ) );
			await act( async () => {
				fireEvent.click( screen.getByText( 'Click me' ) );
				expect( markUpdateComplete ).not.toHaveBeenCalled();
			} );
			expect( markUpdateComplete ).toHaveBeenCalled();
		} );
	} );
} );
