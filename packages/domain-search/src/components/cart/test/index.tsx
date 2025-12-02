import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Cart } from '..';
import { buildCartItem } from '../../../test-helpers/factories/cart';
import { TestDomainSearchWithCart } from '../../../test-helpers/renderer';

describe( 'Cart', () => {
	it( 'renders the mini cart by default when there are items in the cart', () => {
		render(
			<TestDomainSearchWithCart initialCartItems={ [ buildCartItem() ] }>
				<Cart />
			</TestDomainSearchWithCart>
		);

		expect(
			screen.getByLabelText( '1 domain selected. $90 total price. Click to view the cart' )
		).toBeInTheDocument();
	} );

	it( 'does not render the mini cart when there are no items in the cart', () => {
		render(
			<TestDomainSearchWithCart initialCartItems={ [] }>
				<Cart />
			</TestDomainSearchWithCart>
		);

		expect(
			screen.queryByLabelText( '1 domain selected. $90 total price. Click to view the cart' )
		).not.toBeInTheDocument();
	} );

	it( 'opens the full cart when clicking the View cart button', async () => {
		const fireEvent = userEvent.setup();

		render(
			<TestDomainSearchWithCart initialCartItems={ [ buildCartItem() ] }>
				<Cart />
			</TestDomainSearchWithCart>
		);

		const viewCartButton = await screen.findByRole( 'button', { name: 'View cart' } );

		await fireEvent.click( viewCartButton );

		await waitFor( () => expect( screen.getByText( 'Cart' ) ).toBeVisible() );
		await waitForElementToBeRemoved( () => screen.getByRole( 'button', { name: 'View cart' } ) );
	} );

	it( 'closes the full cart when there are no items in the cart', async () => {
		const fireEvent = userEvent.setup();

		render(
			<TestDomainSearchWithCart initialCartItems={ [ buildCartItem() ] }>
				<Cart />
			</TestDomainSearchWithCart>
		);

		const viewCartButton = await screen.findByRole( 'button', { name: 'View cart' } );
		await fireEvent.click( viewCartButton );
		await waitFor( () => expect( screen.getByText( 'Cart' ) ).toBeVisible() );

		await fireEvent.click( screen.getByRole( 'button', { name: 'Remove' } ) );
		await waitFor( () => expect( screen.getByText( 'Cart' ) ).not.toBeVisible() );
	} );

	it( 'closes the full cart when clicking outside it', async () => {
		const fireEvent = userEvent.setup();

		render(
			<TestDomainSearchWithCart initialCartItems={ [ buildCartItem() ] }>
				<Cart />
			</TestDomainSearchWithCart>
		);

		const viewCartButton = await screen.findByRole( 'button', { name: 'View cart' } );
		await fireEvent.click( viewCartButton );
		await waitFor( () => expect( screen.getByText( 'Cart' ) ).toBeVisible() );

		await fireEvent.click( document.body );
		await waitFor( () => expect( screen.getByText( 'Cart' ) ).not.toBeVisible() );

		expect( screen.getByRole( 'button', { name: 'View cart' } ) ).toBeVisible();
	} );

	it( 'closes the full cart when clicking the close button', async () => {
		const fireEvent = userEvent.setup();

		render(
			<TestDomainSearchWithCart initialCartItems={ [ buildCartItem() ] }>
				<Cart />
			</TestDomainSearchWithCart>
		);

		const viewCartButton = await screen.findByRole( 'button', { name: 'View cart' } );
		await fireEvent.click( viewCartButton );
		await waitFor( () => expect( screen.getByText( 'Cart' ) ).toBeVisible() );

		await fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );
		await waitFor( () => expect( screen.getByText( 'Cart' ) ).not.toBeVisible() );

		expect( screen.getByRole( 'button', { name: 'View cart' } ) ).toBeVisible();
	} );
} );
