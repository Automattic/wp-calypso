/**
 * @jest-environment jsdom
 */
import { activeAgencyQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
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

const mockStorage = {
	name: 'Jetpack VaultPress Backup Add-on Storage (10GB)',
	slug: 'jetpack-backup-addon-storage-10gb-monthly',
	product_id: 2117,
	family_slug: 'jetpack-backup-storage',
} as AgencyProduct;

let mockProduct = mockBackup;

jest.mock( '../use-cart-lines', () => ( {
	useCartLines: () => ( {
		lines: [
			{
				item: { slug: mockProduct.slug, quantity: 1 },
				product: mockProduct,
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
	{ approvalStatus = 'approved', product = mockBackup } = {}
) {
	mockProduct = product;
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	queryClient.setQueryData( activeAgencyQuery().queryKey, {
		id: 1,
		approval_status: approvalStatus,
	} as Agency );
	const onToggle = jest.fn();
	const { recordTracksEvent } = render(
		<CartMenu
			items={ [ { slug: product.slug, quantity: 1 } ] }
			products={ [ product ] }
			term="yearly"
			isReferralMode={ isReferralMode }
			isAgencyApproved={ approvalStatus === 'approved' }
			open
			onToggle={ onToggle }
			onRemove={ jest.fn() }
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

	it.each( [ false, true ] )(
		'opens the approval gate instead of a checkout while the agency is in review (referral mode: %s)',
		async ( isReferralMode ) => {
			const { onToggle, recordTracksEvent } = renderCart( isReferralMode, { approvalStatus: 'pending' } );

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

	it( 'names a backup storage add-on, not just its size', async () => {
		renderCart( false, { product: mockStorage } );

		const name = await screen.findByText( 'VaultPress Backup Add-on Storage 10GB' );
		await waitFor( () => expect( name ).toBeVisible() );
	} );
} );
