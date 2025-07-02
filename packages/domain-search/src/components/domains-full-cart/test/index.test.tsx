/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DomainsFullCart } from '../';
import { DomainSearchContext } from '../../DomainSearch/DomainSearch';

const defaultContextValue = {
	isFullCartOpen: false,
	closeFullCart: () => {},
	onContinue: () => {},
	query: '',
	setQuery: () => {},
	cart: {
		items: [],
		total: '',
		onAddItem: () => {},
		onRemoveItem: () => {},
	},
	openFullCart: () => {},
};

describe( 'DomainsFullCart', () => {
	describe( 'cart display', () => {
		test( 'displays the cart when isFullCartOpen is true', async () => {
			render(
				<DomainSearchContext.Provider value={ { ...defaultContextValue, isFullCartOpen: true } }>
					<DomainsFullCart />
				</DomainSearchContext.Provider>
			);

			await waitFor( () => {
				expect( screen.getByText( 'Cart' ) ).toBeVisible();
			} );
		} );

		test( 'doesnt display the cart when isFullCartOpen is false', () => {
			render(
				<DomainSearchContext.Provider value={ { ...defaultContextValue, isFullCartOpen: false } }>
					<DomainsFullCart />
				</DomainSearchContext.Provider>
			);

			expect( screen.queryByText( 'Cart' ) ).not.toBeVisible();
		} );
	} );

	describe( 'cart closing', () => {
		test( 'closes the cart when the close button is clicked', async () => {
			const user = userEvent.setup();
			const closeFullCart = jest.fn();

			render(
				<DomainSearchContext.Provider
					value={ { ...defaultContextValue, isFullCartOpen: true, closeFullCart } }
				>
					<DomainsFullCart />
				</DomainSearchContext.Provider>
			);

			await user.click( await screen.findByRole( 'button', { name: 'Close' } ) );

			expect( closeFullCart ).toHaveBeenCalled();
		} );

		test( 'closes the cart when clicking outside', async () => {
			const user = userEvent.setup();
			const closeFullCart = jest.fn();

			render(
				<DomainSearchContext.Provider
					value={ { ...defaultContextValue, isFullCartOpen: true, closeFullCart } }
				>
					<div>outside</div>
					<DomainsFullCart />
				</DomainSearchContext.Provider>
			);

			await user.click( screen.getByText( 'outside' ) );

			expect( closeFullCart ).toHaveBeenCalled();
		} );
	} );

	test( 'renders the items', async () => {
		render(
			<DomainSearchContext.Provider
				value={ {
					...defaultContextValue,
					isFullCartOpen: true,
					cart: {
						items: [ { domain: 'the-lasso', tld: 'com', price: '$10' } ],
						total: '$10',
						onAddItem: () => {},
						onRemoveItem: () => {},
					},
				} }
			>
				<DomainsFullCart />
			</DomainSearchContext.Provider>
		);

		await waitFor( () => {
			expect( screen.getByLabelText( 'the-lasso.com' ) ).toBeVisible();
		} );
	} );

	test( 'allows rendering other elements within the cart body', async () => {
		render(
			<DomainSearchContext.Provider
				value={ {
					...defaultContextValue,
					isFullCartOpen: true,
					cart: {
						items: [ { domain: 'the-lasso', tld: 'com', price: '$10' } ],
						total: '$10',
						onAddItem: () => {},
						onRemoveItem: () => {},
					},
				} }
			>
				<DomainsFullCart>
					<p>Hello, World!</p>
					<DomainsFullCart.Items />
					<p>Goodbye, World!</p>
				</DomainsFullCart>
			</DomainSearchContext.Provider>
		);

		await waitFor( () => {
			expect( screen.getByText( 'Hello, World!' ) ).toBeVisible();
			expect( screen.getByLabelText( 'the-lasso.com' ) ).toBeVisible();
			expect( screen.getByText( 'Goodbye, World!' ) ).toBeVisible();
		} );
	} );

	test( 'triggers onContinue when the continue button is clicked', async () => {
		const user = userEvent.setup();
		const onContinue = jest.fn();

		render(
			<DomainSearchContext.Provider
				value={ { ...defaultContextValue, isFullCartOpen: true, onContinue } }
			>
				<DomainsFullCart />
			</DomainSearchContext.Provider>
		);

		await user.click( await screen.findByRole( 'button', { name: 'Continue' } ) );

		expect( onContinue ).toHaveBeenCalled();
	} );
} );
