/**
 * @jest-environment jsdom
 */
import { queryClient as apiQueryClient } from '@automattic/api-queries';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../test-utils';
import { DOMAINS_LIST_DEFAULT_VIEW } from '../dataviews/views';
import Domains from '../index';

const mockSearch: { current: Record< string, string > } = { current: {} };

jest.mock( '../../app/router/domains', () => {
	const actual = jest.requireActual( '../../app/router/domains' );
	return {
		...actual,
		domainsIndexRoute: {
			...actual.domainsIndexRoute,
			useSearch: () => mockSearch.current,
			fullPath: '/domains',
		},
	};
} );

jest.mock( '../../app/router/sites', () => {
	const actual = jest.requireActual( '../../app/router/sites' );
	return { ...actual, siteRoute: { fullPath: '/sites/$siteSlug' } };
} );

jest.mock( '../../app/router/me', () => {
	const actual = jest.requireActual( '../../app/router/me' );
	return {
		...actual,
		purchaseSettingsRoute: { fullPath: '/me/billing/purchases/$purchaseId' },
	};
} );

const site = {
	ID: 1,
	name: 'Test Site',
	slug: 'test-site.wordpress.com',
	URL: 'https://test-site.wordpress.com',
	site_owner: 1,
};

const mockDomain = ( index: number, overrides = {} ) => ( {
	domain: `domain${ String( index ).padStart( 2, '0' ) }.com`,
	blog_id: 1,
	blog_name: 'Test Site',
	site_slug: 'test-site.wordpress.com',
	subtype: { id: 'domain_registration', label: 'Domain name registration' },
	domain_status: { id: 'active', label: 'Active', type: 'success' },
	auto_renewing: true,
	current_user_is_owner: true,
	is_domain_only_site: false,
	expiry: '2030-01-01',
	expired: false,
	primary_domain: false,
	can_set_as_primary: false,
	subscription_id: `${ index }`,
	tags: [],
	...overrides,
} );

const mockDomains = ( count: number ) =>
	Array.from( { length: count }, ( _, index ) => mockDomain( index ) );

function mockApis( domains: unknown[], preferences = {} ) {
	const savedPreferences: Record< string, unknown >[] = [];
	const scope = nock( 'https://public-api.wordpress.com' ).persist();
	scope
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, { sites: [ site ] } );
	scope.get( '/rest/v1.2/all-domains' ).query( true ).reply( 200, { domains } );
	scope
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: preferences } );
	scope.post( '/rest/v1.1/me/preferences' ).reply( 200, ( _uri, body ) => {
		const { calypso_preferences } = body as { calypso_preferences: Record< string, unknown > };
		savedPreferences.push( calypso_preferences );
		return { calypso_preferences };
	} );
	scope
		.get( /\/wpcom\/v2\/domains\/ssl\/.*/ )
		.query( true )
		.reply( 200, {
			data: { certificate_provisioned: true, is_newly_registered: false, is_expired: false },
		} );
	return { savedPreferences };
}

const SAVED_CARDS_VIEW = {
	'hosting-dashboard-dataviews-view-domains': { type: 'grid', titleField: 'domain', perPage: 12 },
};

const SAVED_TABLE_VIEW = {
	'hosting-dashboard-dataviews-view-domains': { type: 'table', titleField: 'domain', perPage: 12 },
};

describe( '<Domains>', () => {
	beforeEach( () => {
		mockSearch.current = {};
		apiQueryClient.clear();
	} );

	const domainNames = () =>
		screen.queryAllByRole( 'heading', { level: 3 } ).map( ( heading ) => heading.textContent );

	test( 'shows cards with their actions and no bulk selection by default', async () => {
		mockApis( [ mockDomain( 1 ) ] );

		render( <Domains /> );

		const card = await screen.findByRole( 'group', { name: 'domain01.com' } );
		expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'checkbox' ) ).not.toBeInTheDocument();
		expect( within( card ).getByRole( 'button', { name: 'Settings' } ) ).toBeVisible();
		expect( within( card ).getByRole( 'button', { name: 'DNS' } ) ).toBeVisible();
		expect( within( card ).getByText( 'Active' ) ).toBeVisible();
		expect( within( card ).getByText( 'Registered with us' ) ).toBeVisible();
	} );

	test( 'keeps "Registered with us" on a domain being transferred out', async () => {
		mockApis( [
			mockDomain( 1, {
				domain_status: {
					id: 'pending_transfer',
					label: 'Outgoing transfer pending',
					type: 'warning',
				},
			} ),
		] );

		render( <Domains /> );

		const card = await screen.findByRole( 'group', { name: 'domain01.com' } );
		expect( within( card ).getByText( 'Registered with us' ) ).toBeVisible();
		expect( within( card ).getByText( 'Outgoing transfer pending' ) ).toBeVisible();
	} );

	test( 'shows "Domain name transfer" on an incoming transfer in any state', async () => {
		mockApis(
			[ 'in_progress', 'transfer_error', 'transfer_completed' ].map( ( id, index ) =>
				mockDomain( index, {
					subtype: { id: 'domain_transfer', label: 'From the API' },
					domain_status: { id, label: 'Status', type: 'warning' },
				} )
			)
		);

		render( <Domains /> );

		await screen.findByRole( 'group', { name: 'domain00.com' } );
		expect( screen.getAllByText( 'Domain name transfer' ) ).toHaveLength( 3 );
	} );

	test( 'shows the type, not the primary address, on this all-sites list', async () => {
		mockApis( [ mockDomain( 1, { primary_domain: true } ) ] );

		render( <Domains /> );

		const card = await screen.findByRole( 'group', { name: 'domain01.com' } );
		expect( within( card ).getByText( 'Registered with us' ) ).toBeVisible();
		expect( within( card ).queryByText( 'Primary site address' ) ).not.toBeInTheDocument();
		expect(
			within( card ).queryByRole( 'button', { name: 'Change primary' } )
		).not.toBeInTheDocument();
	} );

	test( 'offers the toolbar controls on the cards', async () => {
		mockApis( mockDomains( 9 ) );

		render( <Domains /> );

		await screen.findByRole( 'group', { name: 'domain00.com' } );
		expect( screen.getByRole( 'searchbox' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Layout' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'View options' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: /filter/i } ) ).toBeVisible();
	} );

	test( 'moves Renew to the footer of an expired domain using the real actions', async () => {
		mockApis( [
			mockDomain( 1, {
				expired: true,
				domain_status: { id: 'expired', label: 'Expired', type: 'error' },
			} ),
		] );

		render( <Domains /> );

		const card = await screen.findByRole( 'group', { name: 'domain01.com' } );
		expect( within( card ).getByRole( 'button', { name: 'Renew' } ) ).toBeVisible();
		expect( within( card ).queryByRole( 'button', { name: 'DNS' } ) ).not.toBeInTheDocument();
	} );

	test( 'shows only cards, without the layout switch, for up to 8 domains', async () => {
		mockApis( mockDomains( 8 ) );

		render( <Domains /> );

		await screen.findByRole( 'group', { name: 'domain00.com' } );
		expect( domainNames() ).toHaveLength( 8 );
		expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Layout' } ) ).not.toBeInTheDocument();
	} );

	test( 'shows cards with the layout switch for 9 domains', async () => {
		mockApis( mockDomains( 9 ) );

		render( <Domains /> );

		await screen.findByRole( 'group', { name: 'domain00.com' } );
		expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Layout' } ) ).toBeVisible();
	} );

	test( 'shows cards with the layout switch for 16 domains', async () => {
		mockApis( mockDomains( 16 ) );

		render( <Domains /> );

		await screen.findByRole( 'group', { name: 'domain00.com' } );
		expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Layout' } ) ).toBeVisible();
	} );

	test( 'shows a table with the layout switch for 17 domains', async () => {
		mockApis( mockDomains( 17 ) );

		render( <Domains /> );

		expect( await screen.findByRole( 'table' ) ).toBeVisible();
		expect( screen.queryByRole( 'group', { name: 'domain00.com' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Layout' } ) ).toBeVisible();
	} );

	test( 'keeps a saved table view and the layout switch for up to 8 domains', async () => {
		mockApis( mockDomains( 8 ), SAVED_TABLE_VIEW );

		render( <Domains /> );

		expect( await screen.findByRole( 'table' ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Layout' } ) ).toBeVisible();
	} );

	test( 'hides the layout switch for a saved view without a layout choice', async () => {
		mockApis( mockDomains( 8 ), SAVED_CARDS_VIEW );

		render( <Domains /> );

		await screen.findByRole( 'group', { name: 'domain00.com' } );
		expect( screen.queryByRole( 'button', { name: 'Layout' } ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the layout switch after moving from a saved table view to cards', async () => {
		const user = userEvent.setup();
		const { savedPreferences } = mockApis( mockDomains( 8 ), {
			'hosting-dashboard-dataviews-view-domains': {
				...DOMAINS_LIST_DEFAULT_VIEW,
				type: 'table',
				filters: [ { field: 'owner', operator: 'isAny', value: [ 'owned-by-me' ] } ],
			},
		} );
		render( <Domains />, { queryClient: apiQueryClient } );

		await screen.findByRole( 'table' );
		await user.click( screen.getByRole( 'button', { name: 'Layout' } ) );
		await user.click( await screen.findByRole( 'menuitemradio', { name: /grid/i } ) );

		await screen.findByRole( 'group', { name: 'domain00.com' } );
		expect( screen.getByRole( 'button', { name: 'Layout' } ) ).toBeVisible();
		await waitFor( () =>
			expect( savedPreferences ).toContainEqual( {
				'hosting-dashboard-dataviews-layout-chosen-domains': true,
			} )
		);
	} );

	test( 'keeps the layout switch for a layout choice until Reset view', async () => {
		const user = userEvent.setup();
		const { savedPreferences } = mockApis( mockDomains( 8 ), {
			'hosting-dashboard-dataviews-layout-chosen-domains': true,
		} );
		render( <Domains />, { queryClient: apiQueryClient } );

		await screen.findByRole( 'group', { name: 'domain00.com' } );
		expect( screen.getByRole( 'button', { name: 'Layout' } ) ).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'View options' } ) );
		await user.click( await screen.findByRole( 'button', { name: 'Reset view' } ) );

		await waitFor( () =>
			expect( screen.queryByRole( 'button', { name: 'Layout' } ) ).not.toBeInTheDocument()
		);
		expect( savedPreferences ).toContainEqual( {
			'hosting-dashboard-dataviews-layout-chosen-domains': null,
		} );
	} );

	test( 'keeps a saved cards view for 17 domains', async () => {
		mockApis( mockDomains( 17 ), SAVED_CARDS_VIEW );

		render( <Domains /> );

		await screen.findByRole( 'group', { name: 'domain00.com' } );
		expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Layout' } ) ).toBeVisible();
	} );

	test( 'shows 12 cards per page with pagination', async () => {
		mockApis(
			Array.from( { length: 13 }, ( _, index ) => mockDomain( index ) ),
			SAVED_CARDS_VIEW
		);

		render( <Domains /> );

		await screen.findByRole( 'group', { name: 'domain00.com' } );
		expect( domainNames() ).toHaveLength( 12 );
		expect( screen.getByRole( 'button', { name: /next page/i } ) ).toBeEnabled();
	} );

	test( 'shows the page from the URL', async () => {
		mockSearch.current = { page: '2' };
		mockApis(
			Array.from( { length: 13 }, ( _, index ) => mockDomain( index ) ),
			SAVED_CARDS_VIEW
		);

		render( <Domains /> );

		await screen.findByRole( 'group', { name: 'domain12.com' } );
		expect( domainNames() ).toEqual( [ 'domain12.com' ] );
	} );

	test( 'applies the default owner filter to the cards', async () => {
		mockApis( [ mockDomain( 1 ), mockDomain( 2, { current_user_is_owner: false } ) ] );

		render( <Domains /> );

		await screen.findByRole( 'group', { name: 'domain01.com' } );
		expect( domainNames() ).toEqual( [ 'domain01.com' ] );
	} );

	test( 'applies the search to the cards and shows the no-results state', async () => {
		mockSearch.current = { search: 'no-such-domain' };
		mockApis( [ mockDomain( 1 ) ] );

		render( <Domains /> );

		expect( await screen.findByText( 'No domains match your search' ) ).toBeVisible();
		expect( domainNames() ).toHaveLength( 0 );
	} );

	test( 'switches to a table without bulk selection and tracks the change', async () => {
		const user = userEvent.setup();
		mockApis( mockDomains( 9 ) );
		const { recordTracksEvent } = render( <Domains />, { queryClient: apiQueryClient } );

		await user.click( await screen.findByRole( 'button', { name: 'Layout' } ) );
		await user.click( await screen.findByRole( 'menuitemradio', { name: /table/i } ) );

		const table = await screen.findByRole( 'table' );
		expect( within( table ).queryByRole( 'checkbox' ) ).not.toBeInTheDocument();
		await user.click( within( table ).getAllByRole( 'button', { name: 'Actions' } )[ 0 ] );
		expect( await screen.findByRole( 'menuitem', { name: /Manage auto-renew/ } ) ).toBeVisible();
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_domains_view_type_changed',
			{ type: 'table' }
		);
	} );

	test( 'opens the purchase settings to manage auto-renew', async () => {
		const user = userEvent.setup();
		mockApis( [ mockDomain( 1, { auto_renewing: false } ) ] );
		const { recordTracksEvent, router } = render( <Domains /> );

		const card = await screen.findByRole( 'group', { name: 'domain01.com' } );
		await user.click( within( card ).getByRole( 'button', { name: 'Actions' } ) );
		await user.click( await screen.findByRole( 'menuitem', { name: 'Manage auto-renew' } ) );

		await waitFor( () =>
			expect( router.state.location.pathname ).toBe( '/me/billing/purchases/1' )
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_dashboard_domains_action_click', {
			action: 'manage-auto-renew',
			layout: 'grid',
			domain: 'domain01.com',
		} );
	} );

	test( 'records the layout an action was used from', async () => {
		const user = userEvent.setup();
		mockApis( [ mockDomain( 1 ) ] );
		const { recordTracksEvent } = render( <Domains /> );

		const card = await screen.findByRole( 'group', { name: 'domain01.com' } );
		await user.click( within( card ).getByRole( 'button', { name: 'DNS' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_dashboard_domains_action_click', {
			action: 'manage-dns-settings',
			layout: 'grid',
			domain: 'domain01.com',
		} );
	} );

	test( 'keeps a saved table view without a blank column for the removed SSL field', async () => {
		mockApis( [ mockDomain( 1 ) ], {
			'hosting-dashboard-dataviews-view-domains': {
				type: 'table',
				titleField: 'domain',
				showMedia: false,
				fields: [ 'blog_name', 'ssl_status', 'expiry', 'domain_status' ],
			},
		} );

		render( <Domains /> );

		const table = await screen.findByRole( 'table' );
		const headers = within( table ).getAllByRole( 'columnheader' );
		expect( headers.map( ( header ) => header.textContent ) ).not.toContain( 'SSL' );
		// Name, site, paid until, status and actions.
		expect( headers ).toHaveLength( 5 );
		expect( screen.queryByRole( 'group', { name: 'domain01.com' } ) ).not.toBeInTheDocument();
	} );

	test( 'moves a saved page size that is no longer offered to the nearest one', async () => {
		mockApis(
			Array.from( { length: 13 }, ( _, index ) => mockDomain( index ) ),
			{
				'hosting-dashboard-dataviews-view-domains': {
					type: 'grid',
					titleField: 'domain',
					perPage: 10,
					fields: [ 'blog_name', 'expiry', 'domain_status' ],
				},
			}
		);

		render( <Domains /> );

		await screen.findByRole( 'group', { name: 'domain00.com' } );
		expect( domainNames() ).toHaveLength( 12 );
	} );

	test( 'saves view changes to the `domains` preference', async () => {
		const user = userEvent.setup();
		const { savedPreferences } = mockApis( mockDomains( 9 ) );
		// `userPreferenceOptimisticMutation` writes to the API package's client.
		render( <Domains />, { queryClient: apiQueryClient } );

		await user.click( await screen.findByRole( 'button', { name: 'Layout' } ) );
		await user.click( await screen.findByRole( 'menuitemradio', { name: /table/i } ) );

		await waitFor( () =>
			expect( savedPreferences ).toContainEqual(
				expect.objectContaining( {
					'hosting-dashboard-dataviews-view-domains': expect.objectContaining( { type: 'table' } ),
				} )
			)
		);
	} );
} );
