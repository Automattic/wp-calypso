/**
 * @vitest-environment jsdom
 */
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { type Mock, vi } from 'vitest';
import { render } from '../../test-utils';
import Domains from '../index';
import type { View } from '@wordpress/dataviews';

vi.mock( '../../app/router/domains', async () => {
	const actual = await vi.importActual< typeof import( '../../app/router/domains' ) >(
		'../../app/router/domains'
	);
	return {
		...actual,
		domainsIndexRoute: {
			...actual.domainsIndexRoute,
			useSearch: () => ( {} ),
			fullPath: '/domains',
		},
	};
} );

vi.mock( '../../app/router/sites', async () => {
	const actual =
		await vi.importActual< typeof import( '../../app/router/sites' ) >( '../../app/router/sites' );
	return { ...actual, siteRoute: { fullPath: '/sites/$siteSlug' } };
} );

const mockDomain = ( name: string ) => ( {
	domain: name,
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
	subscription_id: '1',
	tags: [],
} );

// Media queries are read once and cached, so the answer has to change behind the same object.
let isSmallScreen = false;

beforeAll( () => {
	vi.mocked( window.matchMedia ).mockImplementation(
		( query: string ) =>
			( {
				get matches() {
					return isSmallScreen && query.includes( 'max-width: 782px' );
				},
				media: query,
				addListener: vi.fn(),
				removeListener: vi.fn(),
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
			} ) as unknown as MediaQueryList
	);
} );

afterEach( () => {
	isSmallScreen = false;
} );

function mockApis( savedView: Partial< View > ) {
	const scope = nock( 'https://public-api.wordpress.com' ).persist();
	scope
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, {
			sites: [ { ID: 1, name: 'Test Site', slug: 'test-site.wordpress.com', site_owner: 1 } ],
		} );
	scope
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 200, { domains: [ mockDomain( 'a-domain.com' ), mockDomain( 'b-domain.com' ) ] } );
	scope
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, {
			calypso_preferences: { 'hosting-dashboard-dataviews-view-domains': savedView },
		} );
	scope
		.get( /\/wpcom\/v2\/domains\/ssl\/.*/ )
		.query( true )
		.reply( 200, { data: { certificate_provisioned: true, is_newly_registered: false } } );

	const savedPreferences: Record< string, Record< string, Partial< View > > >[] = [];
	scope.post( '/rest/v1.1/me/preferences' ).reply( 200, ( _uri, body ) => {
		savedPreferences.push( body as ( typeof savedPreferences )[ number ] );
		return { calypso_preferences: {} };
	} );
	return savedPreferences;
}

const SAVED_VIEW: Partial< View > = {
	titleField: 'domain',
	sort: { field: 'domain', direction: 'desc' },
	fields: [ 'blog_name', 'domain_status' ],
};

describe( '<Domains> saved layouts', () => {
	test( 'shows a saved view with an unavailable layout as a table and records it once', async () => {
		mockApis( { ...SAVED_VIEW, type: 'list' } as Partial< View > );

		const { recordTracksEvent } = render( <Domains /> );

		const table = await screen.findByRole( 'table' );
		expect(
			within( table )
				.getAllByText( /-domain\.com$/ )
				.map( ( name ) => name.textContent )
		).toEqual( [ 'b-domain.com', 'a-domain.com' ] );
		expect( screen.getByRole( 'searchbox' ) ).toBeVisible();

		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_domains_saved_layout_fallback',
			{ saved_layout: 'list', fallback_layout: 'table' }
		);
		const fallbackEventCount = ( recordTracksEvent as Mock ).mock.calls.filter(
			( [ eventName ] ) => eventName === 'calypso_dashboard_domains_saved_layout_fallback'
		).length;
		expect( fallbackEventCount ).toBe( 1 );
	} );

	test( 'keeps a saved grid view on the cards', async () => {
		mockApis( { ...SAVED_VIEW, type: 'grid' } as Partial< View > );

		const { recordTracksEvent } = render( <Domains /> );

		await screen.findByRole( 'group', { name: 'a-domain.com' } );
		expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_dashboard_domains_saved_layout_fallback',
			expect.anything()
		);
	} );

	test( 'records nothing when the saved layout is available', async () => {
		mockApis( { ...SAVED_VIEW, type: 'table' } as Partial< View > );

		const { recordTracksEvent } = render( <Domains /> );

		await screen.findByRole( 'table' );
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_dashboard_domains_saved_layout_fallback',
			expect.anything()
		);
	} );

	test( 'shows a saved table view as cards on a small screen, and keeps the table saved', async () => {
		isSmallScreen = true;
		const savedPreferences = mockApis( { ...SAVED_VIEW, type: 'table' } as Partial< View > );
		const user = userEvent.setup();

		const { recordTracksEvent } = render( <Domains /> );

		await screen.findByRole( 'group', { name: 'a-domain.com' } );
		expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Layout' } ) ).not.toBeInTheDocument();

		// A change made on the small screen is saved with the layout the user chose.
		await user.click( screen.getByRole( 'button', { name: 'View options' } ) );
		await user.click( await screen.findByRole( 'radio', { name: 'Sort ascending' } ) );

		await vi.waitFor( () => expect( savedPreferences ).toHaveLength( 1 ) );
		const savedView =
			savedPreferences[ 0 ].calypso_preferences[ 'hosting-dashboard-dataviews-view-domains' ];
		expect( savedView.type ).toBe( 'table' );
		expect( savedView.sort ).toEqual( { field: 'domain', direction: 'asc' } );

		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_dashboard_domains_view_type_changed',
			expect.anything()
		);
		expect( recordTracksEvent ).not.toHaveBeenCalledWith(
			'calypso_dashboard_domains_saved_layout_fallback',
			expect.anything()
		);
	} );
} );
