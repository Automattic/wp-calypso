import { screen, render, waitFor, fireEvent } from '@testing-library/react';
import { withShoppingCart } from '../src/index';
import { planOne, mainCartKey } from './utils/mock-cart-api';
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

	it( 'allows setting the cart key via the mapPropsToCartKey function', async () => {
		const WrappedProductsList = withShoppingCart(
			ProductListWithoutHook,
			( { productsToAddOnClick } ) => {
				if ( productsToAddOnClick.includes( planOne ) ) {
					return mainCartKey;
				}
				return undefined;
			}
		);
		const TestComponent = () => {
			return (
				<div>
					<WrappedProductsList productsToAddOnClick={ [ planOne ] } />
				</div>
			);
		};

		render(
			<MockProvider cartKeyOverride={ 12317981732 }>
				<TestComponent />
			</MockProvider>
		);
		fireEvent.click( screen.getByText( 'Click me' ) );
		await waitFor( () => {
			expect( screen.getByTestId( 'product-list' ) ).toHaveTextContent( planOne.product_name );
		} );
	} );
} );
