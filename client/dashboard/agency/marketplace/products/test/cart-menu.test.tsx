/**
 * @jest-environment jsdom
 */
import { activeAgencyQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import CartMenu from '../cart-menu';
import type { Agency, AgencyProduct } from '@automattic/api-core';

const mockBackup = {
	name: 'Jetpack VaultPress Backup (10GB)',
	slug: 'jetpack-backup-t1',
	product_id: 2112,
	family_slug: 'jetpack-backup',
} as AgencyProduct;

const mockItem = { slug: mockBackup.slug, quantity: 1 };

jest.mock( '../use-cart-lines', () => ( {
	useCartLines: () => ( {
		lines: [
			{
				item: mockItem,
				product: mockBackup,
				priceInfo: { isFree: false, billingTerm: 'yearly' },
				subtotal: 47.4,
			},
		],
		currency: 'USD',
		total: 47.4,
		commission: 0,
		isTotalReady: true,
		hasWpcomHostingPlan: false,
	} ),
} ) );

jest.mock( '@tanstack/react-router', () => ( {
	...jest.requireActual( '@tanstack/react-router' ),
	useLocation: () => ( { pathname: '/products', searchStr: '?category=jetpack' } ),
} ) );

function renderCart(
	isReferralMode: boolean,
	approvalStatus = 'approved',
	onSetQuantity?: ( item: { slug: string }, quantity: number ) => void
) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( activeAgencyQuery().queryKey, {
		id: 1,
		approval_status: approvalStatus,
	} as Agency );
	const onToggle = jest.fn();
	const { recordTracksEvent } = render(
		<CartMenu
			items={ [ mockItem ] }
			products={ [ mockBackup ] }
			term="yearly"
			isReferralMode={ isReferralMode }
			isAgencyApproved={ approvalStatus === 'approved' }
			open
			onToggle={ onToggle }
			onRemove={ jest.fn() }
			onSetQuantity={ onSetQuantity }
		/>,
		{ queryClient }
	);
	return { onToggle, recordTracksEvent };
}

describe( 'CartMenu', () => {
	it( 'links a referral cart to the referral checkout, with the page to come back to', async () => {
		renderCart( true );

		const url = new URL(
			( await screen.findByRole( 'link', { name: 'Checkout' } ) ).getAttribute( 'href' ) ?? '',
			window.location.origin
		);
		expect( url.pathname ).toBe( '/referral-checkout' );
		expect( url.searchParams.get( 'from' ) ).toBe( '/products?category=jetpack' );
	} );

	it( 'links a regular cart to the agency checkout', async () => {
		renderCart( false );

		const url = new URL(
			( await screen.findByRole( 'link', { name: 'Checkout' } ) ).getAttribute( 'href' ) ?? ''
		);
		expect( url.pathname ).toBe( '/checkout/agency/purchase' );
	} );

	it( 'sets how many licenses a line holds from its counter', async () => {
		const onSetQuantity = jest.fn();
		renderCart( false, 'approved', onSetQuantity );

		await userEvent.click( await screen.findByRole( 'button', { name: 'Increment' } ) );

		expect( onSetQuantity ).toHaveBeenCalledWith( mockItem, 2 );
	} );

	it( 'keeps a referral cart to one of each, without a counter', async () => {
		renderCart( true, 'approved', jest.fn() );

		expect( await screen.findByRole( 'button', { name: /Remove/ } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Increment' } ) ).not.toBeInTheDocument();
	} );

	it.each( [ false, true ] )(
		'opens the approval gate instead of a checkout while the agency is in review (referral mode: %s)',
		async ( isReferralMode ) => {
			const { onToggle, recordTracksEvent } = renderCart( isReferralMode, 'pending' );

			expect( screen.queryByRole( 'link', { name: 'Checkout' } ) ).not.toBeInTheDocument();
			await userEvent.click( screen.getByRole( 'button', { name: 'Checkout' } ) );

			expect(
				await screen.findByRole( 'dialog', { name: 'Purchases unlock once you’re approved' } )
			).toBeVisible();
			expect( onToggle ).toHaveBeenCalledWith( false );
			expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_a4a_approval_gate_view', {
				kind: 'purchase',
				approval_status: 'pending',
			} );
			expect( recordTracksEvent ).not.toHaveBeenCalledWith(
				'calypso_a4a_marketplace_checkout_click',
				expect.anything()
			);
		}
	);
} );
