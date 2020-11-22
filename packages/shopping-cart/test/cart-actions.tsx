// This is required to fix the "regeneratorRuntime is not defined" error
import '@automattic/calypso-polyfills';

/**
 * External dependencies
 */
import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { screen, render, waitFor, fireEvent } from '@testing-library/react';

/**
 * Internal dependencies
 */
import { useShoppingCart, ShoppingCartProvider } from '../index';
import { emptyResponseCart } from '../src/empty-carts';
import { RequestCartProduct, ResponseCartProduct, RequestCart, ResponseCart } from '../src/types';

const planWithoutDomain = {
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
			return planWithoutDomain;
	}
	throw new Error( 'Unknown product' );
}

async function setCart( cartKey: string, newCart: RequestCart ): Promise< ResponseCart > {
	if ( cartKey === mainCartKey ) {
		return { ...emptyResponseCart, products: newCart.products.map( createProduct ) };
	}
	throw new Error( 'Unknown cart key' );
}

function ProductList() {
	const { responseCart } = useShoppingCart();
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

describe( 'addProductsToCart', () => {
	it( 'adds a product to the cart', async () => {
		const TestComponent = () => {
			const { addProductsToCart } = useShoppingCart();
			const onClick = () => {
				addProductsToCart( [ planWithoutDomain ] );
			};
			return (
				<div>
					<ProductList />
					<button onClick={ onClick }>Click me</button>
				</div>
			);
		};

		render(
			<MockProvider>
				<TestComponent />
			</MockProvider>
		);
		fireEvent.click( screen.getByText( 'Click me' ) );
		await waitFor( () => screen.getByTestId( 'product-list' ) );
		expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent(
			planWithoutDomain.product_name
		);
	} );
} );
