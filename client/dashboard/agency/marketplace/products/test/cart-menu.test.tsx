/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../../../test-utils';
import CartMenu from '../cart-menu';
import type { AgencyProduct } from '@automattic/api-core';

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

const mockWooProduct = {
	name: 'WooCommerce Bookings',
	slug: 'woocommerce-bookings',
	product_id: 3001,
	family_slug: 'woocommerce-products',
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

function renderCart( isReferralMode: boolean, product = mockBackup ) {
	mockProduct = product;
	return render(
		<CartMenu
			items={ [ { slug: product.slug, quantity: 1 } ] }
			products={ [ product ] }
			term="yearly"
			isReferralMode={ isReferralMode }
			isAgencyApproved
			open
			onToggle={ jest.fn() }
			onRemove={ jest.fn() }
		/>
	);
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

	it( 'names a backup storage add-on, not just its size', async () => {
		renderCart( false, mockStorage );

		const name = await screen.findByText( 'VaultPress Backup Add-on Storage 10GB' );
		await waitFor( () => expect( name ).toBeVisible() );
	} );

	it( 'keeps the vendor in a WooCommerce product name', async () => {
		renderCart( false, mockWooProduct );

		const name = await screen.findByText( 'WooCommerce Bookings' );
		await waitFor( () => expect( name ).toBeVisible() );
	} );
} );
