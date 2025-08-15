/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DomainsMiniCart } from '..';
import {
	buildDomain,
	buildDomainSearchCart,
	buildDomainSearchContext,
} from '../../../test-helpers/factories';
import { DomainSearchContext } from '../../domain-search';

describe( 'DomainsMiniCart', () => {
	describe( 'cart display', () => {
		test( 'displays the mini cart when there are items and full cart is closed', async () => {
			render(
				<DomainSearchContext.Provider
					value={ buildDomainSearchContext( {
						cart: buildDomainSearchCart( {
							items: [ buildDomain( { domain: 'test', tld: 'com', price: '$10' } ) ],
						} ),
					} ) }
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
				<DomainSearchContext.Provider value={ buildDomainSearchContext() }>
					<DomainsMiniCart />
				</DomainSearchContext.Provider>
			);

			expect( screen.queryByText( 'View cart' ) ).not.toBeVisible();
		} );

		test( 'does not display the mini cart when full cart is open', () => {
			render(
				<DomainSearchContext.Provider
					value={ buildDomainSearchContext( {
						isFullCartOpen: true,
						cart: buildDomainSearchCart( {
							items: [ buildDomain( { domain: 'test', tld: 'com', price: '$10' } ) ],
						} ),
					} ) }
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
				value={ buildDomainSearchContext( {
					openFullCart,
					cart: buildDomainSearchCart( {
						items: [ buildDomain( { domain: 'test', tld: 'com', price: '$10' } ) ],
					} ),
				} ) }
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
				value={ buildDomainSearchContext( {
					cart: buildDomainSearchCart( {
						items: [ buildDomain( { domain: 'test', tld: 'com', price: '$10' } ) ],
						total: '$10',
					} ),
				} ) }
			>
				<DomainsMiniCart />
			</DomainSearchContext.Provider>
		);

		await waitFor( () => {
			expect( screen.getByText( '$10' ) ).toBeVisible();
		} );
	} );
} );
