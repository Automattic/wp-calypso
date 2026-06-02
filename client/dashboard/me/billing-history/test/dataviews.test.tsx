/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { getFields } from '../dataviews';
import type { Receipt } from '@automattic/api-core';

const receipt = {
	id: 1,
	service: 'WordPress.com',
	service_slug: 'wpcom',
	currency: 'USD',
	subtotal_integer: 9600,
	tax_integer: 0,
	amount_integer: 9600,
	tax_country_code: 'US',
	date: '2026-05-21T00:00:00+00:00',
	desc: '',
	org: '',
	address: null,
	icon: '',
	url: '',
	support: '',
	pay_ref: '',
	pay_part: '',
	cc_type: '',
	cc_display_brand: '',
	cc_num: '',
	cc_name: '',
	cc_email: '',
	credit: '',
	items: [
		{
			id: 1,
			type: 'refund',
			type_localized: 'Refund',
			domain: null,
			site_id: 1,
			subtotal_integer: 9600,
			tax_integer: 0,
			amount_integer: 9600,
			currency: 'USD',
			licensed_quantity: 0,
			new_quantity: 0,
			product: 'WordPress.com Personal',
			product_slug: 'personal-bundle',
			variation: 'WordPress.com Personal',
			variation_slug: '',
			months_per_renewal_interval: 12,
			wpcom_product_slug: 'personal-bundle',
			cost_overrides: [],
			volume: 0,
			credits_used: null,
			introductory_offer_terms: null,
			price_tier_slug: '',
			saas_redirect_url: '',
		},
	],
} as unknown as Receipt;

jest.mock( '@tanstack/react-router', () => ( {
	Link: ( { children }: { children: React.ReactNode } ) => <span>{ children }</span>,
	useNavigate: () => () => {},
	createLink:
		() =>
		( { children }: { children: React.ReactNode } ) => <span>{ children }</span>,
	createRoute: () => ( {
		lazy: () => ( {} ),
		fullPath: '/me/billing',
	} ),
	createLazyRoute: () => () => ( {} ),
	createRootRoute: () => ( {} ),
	createRouter: () => ( {} ),
	RouterProvider: () => null,
} ) );

jest.mock( '../../../app/router/me', () => ( {
	receiptRoute: {
		fullPath: '/me/billing/receipts/$receiptId',
	},
} ) );

function renderServiceCell( visibleFields: string[] ) {
	const fields = getFields( [ receipt ], [], visibleFields );
	const serviceField = fields.find( ( field ) => field.id === 'service' )!;
	return render( <>{ serviceField.render!( { item: receipt, field: serviceField } as never ) }</> );
}

describe( 'dashboard billing history service cell inline fields', () => {
	it( 'shows Type and Amount inline when those columns are hidden', () => {
		renderServiceCell( [ 'date', 'service' ] );
		expect( screen.getByText( /Type:/ ) ).toBeVisible();
		expect( screen.getByText( /Amount:/ ) ).toBeVisible();
		expect( screen.queryByText( /Date:/ ) ).not.toBeInTheDocument();
	} );

	it( 'shows Date inline when only the App column is visible', () => {
		renderServiceCell( [ 'service' ] );
		expect( screen.getByText( /Date:/ ) ).toBeVisible();
		expect( screen.getByText( /Type:/ ) ).toBeVisible();
		expect( screen.getByText( /Amount:/ ) ).toBeVisible();
	} );

	it( 'shows no inline lines when all columns are visible', () => {
		renderServiceCell( [ 'date', 'service', 'type', 'amount' ] );
		expect( screen.queryByText( /Type:/ ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /Amount:/ ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /Date:/ ) ).not.toBeInTheDocument();
	} );
} );
