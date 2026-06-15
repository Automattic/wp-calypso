/**
 * @jest-environment jsdom
 */
import {
	getAllByRole,
	getByLabelText,
	getByRole,
	getByText,
	queryByText,
	render,
	screen,
	waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { useDomainSearch } from '../../../page/context';
import { buildCart, buildCartItem } from '../../../test-helpers/factories/cart';
import { TestDomainSearch, TestDomainSearchWithCart } from '../../../test-helpers/renderer';
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
		it( 'renders the sale price when it is available', async () => {
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

			expect( await screen.findByLabelText( 'Sale price: $10' ) ).toBeInTheDocument();
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

			expect( await screen.findByLabelText( 'Price: $20' ) ).toBeInTheDocument();
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

		const operation = Promise.withResolvers< void >();

		render(
			<TestDomainSearchWithCart
				initialCartItems={ [
					buildCartItem( { uuid: '1', domain: 'test-caller', tld: 'com' } ),
					buildCartItem( { uuid: '2', domain: 'test-other', tld: 'com' } ),
				] }
				operationPromise={ operation.promise }
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

		operation.resolve();
	} );

	describe( 'cart removal error', () => {
		it( 'shows error message only for the button that initiated the operation', async () => {
			const fireEvent = userEvent.setup();

			const operation = Promise.withResolvers< void >();

			render(
				<TestDomainSearchWithCart
					initialCartItems={ [
						buildCartItem( { uuid: '1', domain: 'test', tld: 'com' } ),
						buildCartItem( { uuid: '2', domain: 'test-caller', tld: 'com' } ),
					] }
					operationPromise={ operation.promise }
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

			operation.reject( new Error( 'Test error' ) );

			await waitFor( () => {
				expect( getByText( testCallerItem, 'Test error' ) ).toBeInTheDocument();
			} );

			expect( queryByText( testItem, 'Test error' ) ).not.toBeInTheDocument();
		} );

		it( 'removes the error message when the remove button is clicked within the notice', async () => {
			const fireEvent = userEvent.setup();

			const operation = Promise.withResolvers< void >();

			render(
				<TestDomainSearchWithCart
					initialCartItems={ [ buildCartItem( { uuid: '1', domain: 'test', tld: 'com' } ) ] }
					operationPromise={ operation.promise }
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

			operation.reject( new Error( 'Test error' ) );

			await waitFor( () => {
				expect( getByText( testItem, 'Test error' ) ).toBeInTheDocument();
			} );

			await fireEvent.click( getByRole( testItem, 'button', { name: 'Close' } ) );

			expect( queryByText( testItem, 'Test error' ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'disables all buttons when there is a mutation in progress', async () => {
		const fireEvent = userEvent.setup();

		const operation = Promise.withResolvers< void >();

		render(
			<TestDomainSearchWithCart
				initialCartItems={ [
					buildCartItem( { uuid: '1', domain: 'test', tld: 'com' } ),
					buildCartItem( { uuid: '2', domain: 'test1', tld: 'com' } ),
				] }
				config={ { skippable: true } }
				operationPromise={ operation.promise }
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

		operation.resolve();

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

	describe( 'bundle grouping', () => {
		const buildBundleMembers = () => [
			buildCartItem( {
				uuid: '1',
				domain: 'example',
				tld: 'com',
				salePrice: undefined,
				price: '$22',
				bundle: { groupId: 'group-1', price: '$40' },
			} ),
			buildCartItem( {
				uuid: '2',
				domain: 'example',
				tld: 'net',
				salePrice: undefined,
				price: '$18',
				bundle: { groupId: 'group-1', price: '$40' },
			} ),
		];

		it( 'renders items sharing a bundle group as one row with the members, one summed price and one remove action', async () => {
			render(
				<TestDomainSearchWithCart initialCartItems={ buildBundleMembers() }>
					<OpenFullCart />
					<FullCart />
				</TestDomainSearchWithCart>
			);

			await waitFor( () => {
				expect( screen.getByText( 'Cart' ) ).toBeVisible();
			} );

			const bundleRow = await screen.findByTitle( 'Domain bundle' );

			expect( getByLabelText( bundleRow, 'example.com' ) ).toBeInTheDocument();
			expect( getByLabelText( bundleRow, 'example.net' ) ).toBeInTheDocument();

			expect( getByLabelText( bundleRow, 'Price: $40' ) ).toBeInTheDocument();
			expect( queryByText( bundleRow, '$22' ) ).not.toBeInTheDocument();
			expect( queryByText( bundleRow, '$18' ) ).not.toBeInTheDocument();

			expect( getAllByRole( bundleRow, 'button', { name: 'Remove bundle' } ) ).toHaveLength( 1 );
		} );

		it( 'renders standalone items on their own rows next to a bundle', async () => {
			render(
				<TestDomainSearchWithCart
					initialCartItems={ [
						...buildBundleMembers(),
						buildCartItem( {
							uuid: '3',
							domain: 'standalone',
							tld: 'org',
							salePrice: undefined,
							price: '$10',
						} ),
					] }
				>
					<OpenFullCart />
					<FullCart />
				</TestDomainSearchWithCart>
			);

			await waitFor( () => {
				expect( screen.getByText( 'Cart' ) ).toBeVisible();
			} );

			expect( await screen.findByTitle( 'Domain bundle' ) ).toBeInTheDocument();

			const standaloneRow = await screen.findByTitle( 'standalone.org' );
			expect( getByLabelText( standaloneRow, 'Price: $10' ) ).toBeInTheDocument();

			// One remove action for the bundle, one for the standalone item.
			expect( await screen.findAllByRole( 'button', { name: 'Remove bundle' } ) ).toHaveLength( 1 );
			expect( await screen.findAllByRole( 'button', { name: 'Remove' } ) ).toHaveLength( 1 );
		} );

		it( 'renders two bundles as two separate grouped rows', async () => {
			render(
				<TestDomainSearchWithCart
					initialCartItems={ [
						...buildBundleMembers(),
						buildCartItem( {
							uuid: '3',
							domain: 'other',
							tld: 'com',
							salePrice: undefined,
							price: '$12',
							bundle: { groupId: 'group-2', price: '$25' },
						} ),
						buildCartItem( {
							uuid: '4',
							domain: 'other',
							tld: 'net',
							salePrice: undefined,
							price: '$13',
							bundle: { groupId: 'group-2', price: '$25' },
						} ),
					] }
				>
					<OpenFullCart />
					<FullCart />
				</TestDomainSearchWithCart>
			);

			await waitFor( () => {
				expect( screen.getByText( 'Cart' ) ).toBeVisible();
			} );

			const bundleRows = await screen.findAllByTitle( 'Domain bundle' );
			expect( bundleRows ).toHaveLength( 2 );

			const [ firstBundle, secondBundle ] = bundleRows;

			expect( getByLabelText( firstBundle, 'example.com' ) ).toBeInTheDocument();
			expect( getByLabelText( firstBundle, 'example.net' ) ).toBeInTheDocument();
			expect( getByLabelText( firstBundle, 'Price: $40' ) ).toBeInTheDocument();

			expect( getByLabelText( secondBundle, 'other.com' ) ).toBeInTheDocument();
			expect( getByLabelText( secondBundle, 'other.net' ) ).toBeInTheDocument();
			expect( getByLabelText( secondBundle, 'Price: $25' ) ).toBeInTheDocument();

			// One remove action per bundle.
			expect( await screen.findAllByRole( 'button', { name: 'Remove bundle' } ) ).toHaveLength( 2 );
		} );

		it( 'removes the whole bundle, and only the bundle, with a single remove action', async () => {
			const fireEvent = userEvent.setup();

			render(
				<TestDomainSearchWithCart
					initialCartItems={ [
						...buildBundleMembers(),
						buildCartItem( { uuid: '3', domain: 'standalone', tld: 'org' } ),
					] }
				>
					<OpenFullCart />
					<FullCart />
				</TestDomainSearchWithCart>
			);

			await waitFor( () => {
				expect( screen.getByText( 'Cart' ) ).toBeVisible();
			} );

			const bundleRow = await screen.findByTitle( 'Domain bundle' );

			await fireEvent.click( getByRole( bundleRow, 'button', { name: 'Remove bundle' } ) );

			await waitFor( () => {
				expect( screen.queryByTitle( 'Domain bundle' ) ).not.toBeInTheDocument();
			} );

			expect( screen.queryByLabelText( 'example.com' ) ).not.toBeInTheDocument();
			expect( screen.queryByLabelText( 'example.net' ) ).not.toBeInTheDocument();
			expect( screen.getByTitle( 'standalone.org' ) ).toBeInTheDocument();
		} );

		it( 'falls back to removing each member individually when onRemoveBundle is not provided', async () => {
			const fireEvent = userEvent.setup();
			const onRemoveItem = jest.fn().mockResolvedValue( undefined );

			render(
				<TestDomainSearch
					cart={ buildCart( {
						items: buildBundleMembers(),
						onRemoveItem,
						onRemoveBundle: undefined,
					} ) }
				>
					<OpenFullCart />
					<FullCart />
				</TestDomainSearch>
			);

			await waitFor( () => {
				expect( screen.getByText( 'Cart' ) ).toBeVisible();
			} );

			const bundleRow = await screen.findByTitle( 'Domain bundle' );

			await fireEvent.click( getByRole( bundleRow, 'button', { name: 'Remove bundle' } ) );

			await waitFor( () => {
				expect( onRemoveItem ).toHaveBeenCalledTimes( 2 );
			} );

			expect( onRemoveItem ).toHaveBeenCalledWith( '1' );
			expect( onRemoveItem ).toHaveBeenCalledWith( '2' );
		} );

		it( 'renders a degenerate single-member group as a plain item', async () => {
			render(
				<TestDomainSearchWithCart
					initialCartItems={ [
						buildCartItem( {
							uuid: '1',
							domain: 'example',
							tld: 'com',
							salePrice: undefined,
							price: '$22',
							bundle: { groupId: 'group-1', price: '$40' },
						} ),
					] }
				>
					<OpenFullCart />
					<FullCart />
				</TestDomainSearchWithCart>
			);

			expect( await screen.findByTitle( 'example.com' ) ).toBeInTheDocument();
			expect( screen.queryByTitle( 'Domain bundle' ) ).not.toBeInTheDocument();
		} );
	} );
} );
