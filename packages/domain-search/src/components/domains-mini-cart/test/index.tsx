/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DomainsMiniCart } from '..';
import { DomainSearchContext } from '../../domain-search';

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

describe( 'DomainsMiniCart', () => {
	describe( 'cart display', () => {
		test( 'displays the mini cart when there are items and full cart is closed', async () => {
			render(
				<DomainSearchContext.Provider
					value={ {
						...defaultContextValue,
						cart: {
							items: [ { uuid: '1', domain: 'test', tld: 'com', price: '$10' } ],
							total: '$10',
							onAddItem: () => {},
							onRemoveItem: () => {},
						},
					} }
				>
					<DomainsMiniCart />
				</DomainSearchContext.Provider>
			);

			await waitFor( () => {
				expect( screen.getByText( 'View cart' ) ).toBeVisible();
			} );
		} );

		test( 'does not display the mini cart when there are no items', () => {
			render(
				<DomainSearchContext.Provider value={ defaultContextValue }>
					<DomainsMiniCart />
				</DomainSearchContext.Provider>
			);

			expect( screen.queryByText( 'View cart' ) ).not.toBeVisible();
		} );

		test( 'does not display the mini cart when full cart is open', () => {
			render(
				<DomainSearchContext.Provider
					value={ {
						...defaultContextValue,
						isFullCartOpen: true,
						cart: {
							items: [ { uuid: '1', domain: 'test', tld: 'com', price: '$10' } ],
							total: '$10',
							onAddItem: () => {},
							onRemoveItem: () => {},
						},
					} }
				>
					<DomainsMiniCart />
				</DomainSearchContext.Provider>
			);

			expect( screen.queryByText( 'View cart' ) ).not.toBeVisible();
		} );
	} );

	test( 'opens the full cart when view cart is clicked', async () => {
		const user = userEvent.setup();
		const openFullCart = jest.fn();

		render(
			<DomainSearchContext.Provider
				value={ {
					...defaultContextValue,
					openFullCart,
					cart: {
						items: [ { uuid: '1', domain: 'test', tld: 'com', price: '$10' } ],
						total: '$10',
						onAddItem: () => {},
						onRemoveItem: () => {},
					},
				} }
			>
				<DomainsMiniCart />
			</DomainSearchContext.Provider>
		);

		await user.click( await screen.findByText( 'View cart' ) );

		expect( openFullCart ).toHaveBeenCalled();
	} );

	test( 'displays the cart total', async () => {
		render(
			<DomainSearchContext.Provider
				value={ {
					...defaultContextValue,
					cart: {
						items: [ { uuid: '1', domain: 'test', tld: 'com', price: '$10' } ],
						total: '$10',
						onAddItem: () => {},
						onRemoveItem: () => {},
					},
				} }
			>
				<DomainsMiniCart />
			</DomainSearchContext.Provider>
		);

		await waitFor( () => {
			expect( screen.getByText( '$10' ) ).toBeVisible();
		} );
	} );
} );
