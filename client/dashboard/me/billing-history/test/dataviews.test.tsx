/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import { filterSortAndPaginate } from '@wordpress/dataviews';
import { type ComponentType } from 'react';
import { render } from '../../../test-utils';
import { getFields } from '../dataviews';
import type { Receipt, Site, User } from '@automattic/api-core';

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

const LOCALE = 'en-gb';
const testUser = { ID: 1, username: 'testuser', language: LOCALE } as User;

function renderServiceCell( visibleFields: string[] ) {
	const fields = getFields( [ receipt ], [], visibleFields, LOCALE );
	const serviceField = fields.find( ( field ) => field.id === 'service' )!;
	const ServiceCell = serviceField.render as ComponentType< { item: Receipt } >;
	return render( <ServiceCell item={ receipt } />, { user: testUser } );
}

describe( '<BillingHistory>', () => {
	test( 'shows Type and Amount inline when those columns are hidden', async () => {
		renderServiceCell( [ 'date', 'service' ] );
		expect( await screen.findByText( 'Type' ) ).toBeVisible();
		expect( screen.getByText( 'Refund' ) ).toBeVisible();
		expect( screen.getByText( 'Amount' ) ).toBeVisible();
		expect( screen.getByText( '$96' ) ).toBeVisible();
		expect( screen.queryByText( 'Date' ) ).not.toBeInTheDocument();
	} );

	test( 'shows Date inline when only the App column is visible', async () => {
		renderServiceCell( [ 'service' ] );
		expect( await screen.findByText( 'Date' ) ).toBeVisible();
		expect( screen.getByText( '21 May 2026' ) ).toBeVisible(); // Matches locale of the `testUser`
		expect( screen.getByText( 'Type' ) ).toBeVisible();
		expect( screen.getByText( 'Refund' ) ).toBeVisible();
		expect( screen.getByText( 'Amount' ) ).toBeVisible();
		expect( screen.getByText( '$96' ) ).toBeVisible();
	} );

	test( 'shows no inline lines when all columns are visible', async () => {
		renderServiceCell( [ 'date', 'service', 'type', 'amount' ] );
		// Wait for the App cell's receipt link to render before asserting absence.
		expect( await screen.findByRole( 'link' ) ).toBeVisible();
		expect( screen.queryByText( 'Type' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Amount' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Date' ) ).not.toBeInTheDocument();
	} );

	describe( 'site filtering', () => {
		const siteA = { ID: 1, name: 'Site A', slug: 'site-a.wordpress.com' } as Site;
		const siteB = { ID: 2, name: 'Site B', slug: 'site-b.wordpress.com' } as Site;

		const receiptForSiteA = receipt;
		const receiptForSiteB = {
			...receipt,
			id: 2,
			items: [ { ...receipt.items[ 0 ], id: 2, site_id: 2 } ],
		} as Receipt;

		test( 'offers a site filter when the user has more than one site', () => {
			const fields = getFields( [ receiptForSiteA ], [], [ 'date', 'service' ], LOCALE, [
				siteA,
				siteB,
			] );
			const siteField = fields.find( ( field ) => field.id === 'site' )!;

			expect( siteField.filterBy ).not.toBe( false );
			expect( siteField.elements ).toEqual( [
				{ value: '1', label: 'Site A (site-a.wordpress.com)' },
				{ value: '2', label: 'Site B (site-b.wordpress.com)' },
			] );
		} );

		test( 'does not offer a site filter when the user has only one site', () => {
			const fields = getFields( [ receiptForSiteA ], [], [ 'date', 'service' ], LOCALE, [ siteA ] );
			const siteField = fields.find( ( field ) => field.id === 'site' )!;

			expect( siteField.filterBy ).toBe( false );
		} );

		test( 'filtering by site only keeps receipts with a matching line item', () => {
			const fields = getFields(
				[ receiptForSiteA, receiptForSiteB ],
				[],
				[ 'date', 'service' ],
				LOCALE,
				[ siteA, siteB ]
			);

			const { data } = filterSortAndPaginate(
				[ receiptForSiteA, receiptForSiteB ],
				{
					type: 'table',
					filters: [ { field: 'site', operator: 'isAny', value: [ '1' ] } ],
				},
				fields
			);

			expect( data ).toEqual( [ receiptForSiteA ] );
		} );
	} );
} );
