/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { render } from '../../../../test-utils';
import CartMenu from '../cart-menu';
import type { AgencyProduct } from '@automattic/api-core';

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

function renderCart( isReferralMode: boolean ) {
	return render(
		<CartMenu
			items={ [ mockItem ] }
			products={ [ mockBackup ] }
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
} );
