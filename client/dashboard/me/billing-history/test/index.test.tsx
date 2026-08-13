/**
 * @jest-environment jsdom
 */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import BillingHistory from '../index';
import type { Receipt, Site, User } from '@automattic/api-core';

const SITE_A_ID = 1;
const SITE_B_ID = 2;

const sites = [
	{
		ID: SITE_A_ID,
		name: 'Site A',
		slug: 'site-a.wordpress.com',
	} as Site,
	{
		ID: SITE_B_ID,
		name: 'Site B',
		slug: 'site-b.wordpress.com',
	} as Site,
];

function makeReceipt( id: number, siteId: number, variation: string ): Receipt {
	return {
		id,
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
				id,
				type: 'recurring',
				type_localized: 'Renewal',
				domain: null,
				site_id: siteId,
				subtotal_integer: 9600,
				tax_integer: 0,
				amount_integer: 9600,
				currency: 'USD',
				licensed_quantity: 0,
				new_quantity: 0,
				product: variation,
				product_slug: 'personal-bundle',
				variation,
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
}

const receipts = [
	makeReceipt( 1, SITE_A_ID, 'Site A Personal Plan' ),
	makeReceipt( 2, SITE_B_ID, 'Site B Business Plan' ),
];

const testUser = { ID: 1, username: 'testuser', language: 'en' } as User;

function mockEndpoints( { siteList = sites }: { siteList?: Site[] } = {} ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } );

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.3/me/billing-history/past' )
		.query( true )
		.reply( 200, { billing_history: receipts, billing_history_total: receipts.length } );

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, { sites: siteList, total: siteList.length } );
}

describe( '<BillingHistory>', () => {
	test( 'shows receipts for every site', async () => {
		mockEndpoints();
		render( <BillingHistory />, { user: testUser } );

		const table = await screen.findByRole( 'table' );
		expect( within( table ).getByText( 'Site A Personal Plan' ) ).toBeVisible();
		expect( within( table ).getByText( 'Site B Business Plan' ) ).toBeVisible();
	} );

	test( 'offers a site filter when the user has more than one site', async () => {
		mockEndpoints();
		const user = userEvent.setup();
		render( <BillingHistory />, { user: testUser } );

		await screen.findByRole( 'table' );
		await user.click( screen.getByRole( 'button', { name: 'Add filter' } ) );

		expect( screen.getByRole( 'menuitem', { name: 'Site' } ) ).toBeVisible();
	} );

	test( 'does not offer a site filter when the user only has one site', async () => {
		mockEndpoints( { siteList: [ sites[ 0 ] ] } );
		const user = userEvent.setup();
		render( <BillingHistory />, { user: testUser } );

		await screen.findByRole( 'table' );
		await user.click( screen.getByRole( 'button', { name: 'Add filter' } ) );

		expect( screen.queryByRole( 'menuitem', { name: 'Site' } ) ).not.toBeInTheDocument();
	} );
} );
