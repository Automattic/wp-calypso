/**
 * @vitest-environment jsdom
 */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { APP_CONTEXT_DEFAULT_CONFIG } from '../../../app/context';
import { render } from '../../../test-utils';
import BillingHistory from '../index';
import type { AppConfig } from '../../../app/context';
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

// Hosts that scope these screens to a site have no `me` section of their own.
const configWithMeSection: AppConfig = {
	...APP_CONTEXT_DEFAULT_CONFIG,
	supports: {
		...APP_CONTEXT_DEFAULT_CONFIG.supports,
		me: { billing: { monetizeSubscriptions: false }, security: false, apps: false },
	},
};

function mockEndpoints( {
	siteList = sites,
	preferences = {},
	receiptList = receipts,
}: {
	siteList?: Site[];
	preferences?: Record< string, unknown >;
	receiptList?: Receipt[];
} = {} ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: preferences } );

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.3/me/billing-history/past' )
		.query( true )
		.reply( 200, { billing_history: receiptList, billing_history_total: receiptList.length } );

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
		render( <BillingHistory />, { user: testUser, config: configWithMeSection } );

		await screen.findByRole( 'table' );
		await user.click( screen.getByRole( 'button', { name: 'Add filter' } ) );

		expect( await screen.findByRole( 'menuitem', { name: 'Site' } ) ).toBeVisible();
	} );

	test( 'does not offer a site filter when the user only has one site', async () => {
		mockEndpoints( { siteList: [ sites[ 0 ] ] } );
		const user = userEvent.setup();
		render( <BillingHistory />, { user: testUser, config: configWithMeSection } );

		await screen.findByRole( 'table' );
		await user.click( screen.getByRole( 'button', { name: 'Add filter' } ) );

		expect( screen.queryByRole( 'menuitem', { name: 'Site' } ) ).not.toBeInTheDocument();
	} );

	test( 'does not offer a site filter when the host scopes the screen to one site', async () => {
		mockEndpoints();
		const user = userEvent.setup();
		render( <BillingHistory />, { user: testUser } );

		await screen.findByRole( 'table' );
		await user.click( screen.getByRole( 'button', { name: 'Add filter' } ) );

		expect( screen.queryByRole( 'menuitem', { name: 'Site' } ) ).not.toBeInTheDocument();
	} );

	test( 'sorts receipts by app', async () => {
		mockEndpoints( {
			preferences: {
				'hosting-dashboard-dataviews-view-me-billing-history': {
					type: 'table',
					fields: [ 'date', 'service', 'type', 'amount' ],
					sort: { field: 'service', direction: 'desc' },
				},
			},
		} );
		render( <BillingHistory />, { user: testUser } );

		const table = await screen.findByRole( 'table' );
		const receiptLinks = within( table ).getAllByRole( 'link', { name: 'View receipt' } );
		expect( receiptLinks.map( ( link ) => link.textContent ) ).toEqual( [
			expect.stringContaining( 'Site B Business Plan' ),
			expect.stringContaining( 'Site A Personal Plan' ),
		] );
	} );

	describe( 'empty states', () => {
		afterEach( () => {
			window.history.replaceState( null, '', '/' );
		} );

		test( 'replaces the list when there are no receipts at all', async () => {
			mockEndpoints( { receiptList: [] } );
			render( <BillingHistory />, { user: testUser, config: configWithMeSection } );

			expect( await screen.findByRole( 'heading', { name: 'No receipts yet' } ) ).toBeVisible();
			expect(
				screen.getByText( 'Receipts will appear here after your first purchase.' )
			).toBeVisible();
			expect( screen.queryByRole( 'searchbox' ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
		} );

		test( 'does not show an empty state while the receipts load', async () => {
			let respond: () => void = () => {};
			const response = new Promise< void >( ( resolve ) => {
				respond = resolve;
			} );
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.get( '/rest/v1.1/me/preferences' )
				.query( true )
				.reply( 200, { calypso_preferences: {} } );
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.2/me/sites' )
				.query( true )
				.reply( 200, { sites, total: sites.length } );
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.3/me/billing-history/past' )
				.query( true )
				.reply( async () => {
					await response;
					return [ 200, { billing_history: [], billing_history_total: 0 } ];
				} );
			render( <BillingHistory />, { user: testUser, config: configWithMeSection } );

			// The toolbar is there, so the page is past its own loading placeholder.
			expect( await screen.findByRole( 'searchbox' ) ).toBeVisible();
			expect( screen.queryByRole( 'heading', { level: 2 } ) ).not.toBeInTheDocument();

			respond();
			expect( await screen.findByRole( 'heading', { name: 'No receipts yet' } ) ).toBeVisible();
		} );

		test( 'does not show an empty state when the receipts fail to load', async () => {
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.get( '/rest/v1.1/me/preferences' )
				.query( true )
				.reply( 200, { calypso_preferences: {} } );
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.2/me/sites' )
				.query( true )
				.reply( 200, { sites, total: sites.length } );
			nock( 'https://public-api.wordpress.com' )
				.get( '/rest/v1.3/me/billing-history/past' )
				.query( true )
				.reply( 500, { error: 'server_error' } );
			render( <BillingHistory />, { user: testUser, config: configWithMeSection } );

			expect( await screen.findByText( 'No results' ) ).toBeVisible();
			expect( screen.getByRole( 'searchbox' ) ).toBeVisible();
			expect( screen.queryByRole( 'heading', { level: 2 } ) ).not.toBeInTheDocument();
		} );

		test( 'keeps the toolbar when a search finds nothing', async () => {
			mockEndpoints();
			const user = userEvent.setup();
			render( <BillingHistory />, { user: testUser, config: configWithMeSection } );

			await screen.findByRole( 'table' );
			await user.type( screen.getByRole( 'searchbox' ), 'no such receipt' );

			expect(
				await screen.findByRole( 'heading', { name: 'No receipts match your search' } )
			).toBeVisible();
			expect( screen.getByText( 'Try a different search term.' ) ).toBeVisible();
			expect( screen.getByRole( 'searchbox' ) ).toBeVisible();
		} );

		test( 'keeps the toolbar when the filters find nothing', async () => {
			mockEndpoints( {
				preferences: {
					'hosting-dashboard-dataviews-view-me-billing-history': {
						type: 'table',
						fields: [ 'date', 'service', 'type', 'amount' ],
						filters: [ { field: 'site', operator: 'isAny', value: [ '999' ] } ],
					},
				},
			} );
			render( <BillingHistory />, { user: testUser, config: configWithMeSection } );

			expect(
				await screen.findByRole( 'heading', { name: 'No receipts match your filters' } )
			).toBeVisible();
			expect( screen.getByText( 'Try different filters, or reset them.' ) ).toBeVisible();
			expect( screen.getByRole( 'searchbox' ) ).toBeVisible();
		} );

		test( 'says the site has no receipts when the host locks the list to a site', async () => {
			mockEndpoints();
			window.history.replaceState( null, '', '/?site=999' );
			// No `me` section: the host sets the site filter and the visitor cannot reset it.
			render( <BillingHistory />, { user: testUser } );

			expect(
				await screen.findByRole( 'heading', { name: 'No receipts for this site' } )
			).toBeVisible();
			expect(
				screen.getByText( 'Receipts for purchases on this site will appear here.' )
			).toBeVisible();
			expect(
				screen.queryByText( 'Try different filters, or reset them.' )
			).not.toBeInTheDocument();
			expect( screen.queryByRole( 'searchbox' ) ).not.toBeInTheDocument();
		} );

		test( 'uses the site wording on a host with no account section', async () => {
			mockEndpoints( { receiptList: [] } );
			// No `me` section and no site filter in the URL yet.
			render( <BillingHistory />, { user: testUser } );

			expect(
				await screen.findByRole( 'heading', { name: 'No receipts for this site' } )
			).toBeVisible();
			expect(
				screen.queryByRole( 'heading', { name: 'No receipts yet' } )
			).not.toBeInTheDocument();
		} );

		test( 'lists the receipts of the site the host locks the list to', async () => {
			mockEndpoints();
			window.history.replaceState( null, '', `/?site=${ SITE_A_ID }` );
			render( <BillingHistory />, { user: testUser } );

			const table = await screen.findByRole( 'table' );
			expect( within( table ).getByText( 'Site A Personal Plan' ) ).toBeVisible();
			expect( within( table ).queryByText( 'Site B Business Plan' ) ).not.toBeInTheDocument();
		} );
	} );
} );
