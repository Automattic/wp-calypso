import { screen, render, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { withShoppingCart } from '../src/index';
import { planOne } from './utils/mock-cart-api';
import { MockProvider, ProductListWithoutHook } from './utils/mock-components';

import '@testing-library/jest-dom/extend-expect';

describe( 'withShoppingCart', () => {
	it( 'provides both shoppingCartManager and cart props to the wrapped component', async () => {
		const WrappedProductsList = withShoppingCart( ProductListWithoutHook );
		const TestComponent = () => {
			return (
				<div>
					<WrappedProductsList productsToAddOnClick={ [ planOne ] } />
				</div>
			);
		};

		render(
			<MockProvider>
				<TestComponent />
			</MockProvider>
		);
		fireEvent.click( screen.getByText( 'Click me' ) );
		await waitFor( () => {
			expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planOne.product_name );
		} );
	} );
} );
