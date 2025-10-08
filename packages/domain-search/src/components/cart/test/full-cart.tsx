/**
 * @jest-environment jsdom
 */
import { getByRole, getByText, queryByText, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { useDomainSearch } from '../../../page/context';
import { buildCartItem } from '../../../test-helpers/factories/cart';
import { TestDomainSearchWithCart } from '../../../test-helpers/renderer';
import { FullCart } from '../full-cart';

const OpenFullCart = () => {
	const { openFullCart } = useDomainSearch();

	useEffect( () => {
		openFullCart();
	}, [ openFullCart ] );

	return null;
};

describe( 'FullCart', () => {
	it( 'renders the cart items, quantity and total', async () => {
		render(
			<TestDomainSearchWithCart
				initialCartItems={ [
					buildCartItem( {
						uuid: '1',
						domain: 'test',
						salePrice: undefined,
						price: '$10',
						tld: 'com',
					} ),
					buildCartItem( {
						uuid: '2',
						domain: 'test1',
						salePrice: undefined,
						price: '$10',
						tld: 'com',
					} ),
				] }
			>
				<OpenFullCart />
				<FullCart />
			</TestDomainSearchWithCart>
		);

		expect( await screen.findByTitle( 'test.com' ) ).toBeInTheDocument();
		expect( await screen.findByTitle( 'test1.com' ) ).toBeInTheDocument();
		expect( await screen.findByText( '2 domains' ) ).toBeInTheDocument();
		expect( await screen.findByText( '$20' ) ).toBeInTheDocument();
	} );

	describe( 'prices', () => {
		it( 'renders the price with the sale price when it is available', async () => {
			render(
				<TestDomainSearchWithCart
					initialCartItems={ [
						buildCartItem( { domain: 'test', tld: 'com', salePrice: '$10', price: '$20' } ),
					] }
				>
					<OpenFullCart />
					<FullCart />
				</TestDomainSearchWithCart>
			);

			expect( await screen.findByLabelText( 'Original price: $20/year' ) ).toBeInTheDocument();
			expect( await screen.findByLabelText( 'Sale price: $10/year' ) ).toBeInTheDocument();
			expect( screen.queryByLabelText( /Price/ ) ).not.toBeInTheDocument();
		} );

		it( 'renders the price without the sale price when it is not available', async () => {
			render(
				<TestDomainSearchWithCart
					initialCartItems={ [
						buildCartItem( { domain: 'test', tld: 'com', salePrice: undefined, price: '$20' } ),
					] }
				>
					<OpenFullCart />
					<FullCart />
				</TestDomainSearchWithCart>
			);

			expect( await screen.findByLabelText( 'Price: $20/year' ) ).toBeInTheDocument();
			expect( screen.queryByLabelText( /Original price/ ) ).not.toBeInTheDocument();
			expect( screen.queryByLabelText( /Sale price/ ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'calls onContinue when the continue button is clicked', async () => {
		const fireEvent = userEvent.setup();
		const onContinue = jest.fn();

		render(
			<TestDomainSearchWithCart
				initialCartItems={ [ buildCartItem( { domain: 'test', tld: 'com' } ) ] }
				events={ { onContinue } }
			>
				<OpenFullCart />
				<FullCart />
			</TestDomainSearchWithCart>
		);

		await fireEvent.click( await screen.findByRole( 'button', { name: 'Continue' } ) );

		expect( onContinue ).toHaveBeenCalled();
	} );

	it( 'shows loading state only for the button that initiated the operation', async () => {
		const fireEvent = userEvent.setup();

		const removeItemPromise = Promise.withResolvers< void >();

		render(
			<TestDomainSearchWithCart
				initialCartItems={ [
					buildCartItem( { uuid: '1', domain: 'test-caller', tld: 'com' } ),
					buildCartItem( { uuid: '2', domain: 'test-other', tld: 'com' } ),
				] }
				removeItemPromise={ removeItemPromise.promise }
			>
				<OpenFullCart />
				<FullCart />
			</TestDomainSearchWithCart>
		);

		await waitFor( () => {
			expect( screen.getByText( 'Cart' ) ).toBeVisible();
		} );

		const testCallerItem = await screen.findByTitle( 'test-caller.com' );

		await fireEvent.click( getByRole( testCallerItem, 'button', { name: 'Remove' } ) );

		const [ testCallerRemoveButton, testOtherRemoveButton ] = await screen.findAllByRole(
			'button',
			{
				name: 'Remove',
			}
		);

		expect( testCallerRemoveButton ).toHaveClass( 'is-busy' );
		expect( testOtherRemoveButton ).not.toHaveClass( 'is-busy' );

		removeItemPromise.resolve();
	} );

	describe( 'cart removal error', () => {
		it( 'shows error message only for the button that initiated the operation', async () => {
			const fireEvent = userEvent.setup();

			const removeItemPromise = Promise.withResolvers< void >();

			render(
				<TestDomainSearchWithCart
					initialCartItems={ [
						buildCartItem( { uuid: '1', domain: 'test', tld: 'com' } ),
						buildCartItem( { uuid: '2', domain: 'test-caller', tld: 'com' } ),
					] }
					removeItemPromise={ removeItemPromise.promise }
				>
					<OpenFullCart />
					<FullCart />
				</TestDomainSearchWithCart>
			);

			await waitFor( () => {
				expect( screen.getByText( 'Cart' ) ).toBeVisible();
			} );

			const testCallerItem = await screen.findByTitle( 'test-caller.com' );
			const testItem = await screen.findByTitle( 'test.com' );

			await fireEvent.click( getByRole( testCallerItem, 'button', { name: 'Remove' } ) );

			removeItemPromise.reject( new Error( 'Test error' ) );

			await waitFor( () => {
				expect( getByText( testCallerItem, 'Test error' ) ).toBeInTheDocument();
			} );

			expect( queryByText( testItem, 'Test error' ) ).not.toBeInTheDocument();
		} );

		it( 'removes the error message when the remove button is clicked within the notice', async () => {
			const fireEvent = userEvent.setup();

			const removeItemPromise = Promise.withResolvers< void >();

			render(
				<TestDomainSearchWithCart
					initialCartItems={ [ buildCartItem( { uuid: '1', domain: 'test', tld: 'com' } ) ] }
					removeItemPromise={ removeItemPromise.promise }
				>
					<OpenFullCart />
					<FullCart />
				</TestDomainSearchWithCart>
			);

			await waitFor( () => {
				expect( screen.getByText( 'Cart' ) ).toBeVisible();
			} );

			const testItem = await screen.findByTitle( 'test.com' );

			await fireEvent.click( getByRole( testItem, 'button', { name: 'Remove' } ) );

			removeItemPromise.reject( new Error( 'Test error' ) );

			await waitFor( () => {
				expect( getByText( testItem, 'Test error' ) ).toBeInTheDocument();
			} );

			await fireEvent.click( getByRole( testItem, 'button', { name: 'Close' } ) );

			expect( queryByText( testItem, 'Test error' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'disables all buttons when there is a mutation in progress', async () => {
		const fireEvent = userEvent.setup();

		const removeItemPromise = Promise.withResolvers< void >();

		render(
			<TestDomainSearchWithCart
				initialCartItems={ [
					buildCartItem( { uuid: '1', domain: 'test', tld: 'com' } ),
					buildCartItem( { uuid: '2', domain: 'test1', tld: 'com' } ),
				] }
				config={ { skippable: true } }
				removeItemPromise={ removeItemPromise.promise }
			>
				<OpenFullCart />
				<FullCart />
			</TestDomainSearchWithCart>
		);

		await waitFor( () => {
			expect( screen.getByText( 'Cart' ) ).toBeVisible();
		} );

		const testComItem = await screen.findByTitle( 'test.com' );

		await fireEvent.click( getByRole( testComItem, 'button', { name: 'Remove' } ) );

		const [ testComRemoveButton, test1ComRemoveButton ] = await screen.findAllByRole( 'button', {
			name: 'Remove',
		} );

		expect( testComRemoveButton ).toBeDisabled();
		expect( test1ComRemoveButton ).toBeDisabled();

		const continueButton = screen.getByRole( 'button', { name: 'Continue' } );
		expect( continueButton ).toBeDisabled();

		const skipButton = screen.getByRole( 'button', { name: 'Choose a domain later' } );
		expect( skipButton ).toBeDisabled();

		removeItemPromise.resolve();

		await waitFor( () => {
			expect( continueButton ).not.toBeDisabled();
			expect( skipButton ).not.toBeDisabled();
		} );
	} );

	it( 'allows skipping the step when config.skippable is true', async () => {
		const fireEvent = userEvent.setup();
		const onSkip = jest.fn();

		render(
			<TestDomainSearchWithCart
				initialCartItems={ [ buildCartItem( { domain: 'test', tld: 'com' } ) ] }
				config={ { skippable: true } }
				events={ { onSkip } }
			>
				<OpenFullCart />
				<FullCart />
			</TestDomainSearchWithCart>
		);

		await fireEvent.click( await screen.findByRole( 'button', { name: 'Choose a domain later' } ) );

		expect( onSkip ).toHaveBeenCalledWith();
	} );

	it( 'does not render the skip button when config.skippable is false', async () => {
		render(
			<TestDomainSearchWithCart
				initialCartItems={ [ buildCartItem( { domain: 'test', tld: 'com' } ) ] }
			>
				<OpenFullCart />
				<FullCart />
			</TestDomainSearchWithCart>
		);

		await waitFor( () => {
			expect( screen.getByText( 'Cart' ) ).toBeVisible();
		} );

		expect(
			screen.queryByRole( 'button', { name: 'Choose a domain later' } )
		).not.toBeInTheDocument();
	} );

	it( 'renders the BeforeFullCartItems slot when it is provided', async () => {
		const BeforeFullCartItems = () => <div>Before Full Cart Items</div>;

		render(
			<TestDomainSearchWithCart
				initialCartItems={ [ buildCartItem( { domain: 'test', tld: 'com' } ) ] }
				slots={ { BeforeFullCartItems } }
			>
				<OpenFullCart />
				<FullCart />
			</TestDomainSearchWithCart>
		);

		expect( await screen.findByText( 'Before Full Cart Items' ) ).toBeInTheDocument();
	} );
} );
