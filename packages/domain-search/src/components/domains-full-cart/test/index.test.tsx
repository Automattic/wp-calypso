/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DomainsFullCart } from '../';
import {
	buildDomain,
	buildDomainSearchCart,
	buildDomainSearchContext,
} from '../../../test-helpers/factories';
import { DomainSearchContext } from '../../domain-search';

describe( 'DomainsFullCart', () => {
	describe( 'cart display', () => {
		test( 'displays the cart when isFullCartOpen is true', async () => {
			render(
				<DomainSearchContext.Provider
					value={ buildDomainSearchContext( { isFullCartOpen: true } ) }
				>
					<DomainsFullCart />
				</DomainSearchContext.Provider>
			);

			await waitFor( () => {
				expect( screen.getByText( 'Cart' ) ).toBeVisible();
			} );
		} );

		test( 'doesnt display the cart when isFullCartOpen is false', () => {
			render(
				<DomainSearchContext.Provider
					value={ buildDomainSearchContext( { isFullCartOpen: false } ) }
				>
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
					value={ buildDomainSearchContext( { isFullCartOpen: true, closeFullCart } ) }
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
					value={ buildDomainSearchContext( { isFullCartOpen: true, closeFullCart } ) }
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
				value={ buildDomainSearchContext( {
					isFullCartOpen: true,
					cart: buildDomainSearchCart( {
						items: [ buildDomain( { domain: 'the-lasso', tld: 'com', price: '$10' } ) ],
					} ),
				} ) }
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
				value={ buildDomainSearchContext( {
					isFullCartOpen: true,
					cart: buildDomainSearchCart( {
						items: [ buildDomain( { domain: 'the-lasso', tld: 'com', price: '$10' } ) ],
					} ),
				} ) }
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
				value={ buildDomainSearchContext( { isFullCartOpen: true, onContinue } ) }
			>
				<DomainsFullCart />
			</DomainSearchContext.Provider>
		);

		await user.click( await screen.findByRole( 'button', { name: 'Continue' } ) );

		expect( onContinue ).toHaveBeenCalled();
	} );
} );
