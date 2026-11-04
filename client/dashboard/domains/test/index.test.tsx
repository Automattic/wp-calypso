/**
 * @jest-environment jsdom
 */
import { queryClient as apiQueryClient } from '@automattic/api-queries';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../test-utils';
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
	} );

	test( 'offers the toolbar controls on the cards', async () => {
		mockApis( [ mockDomain( 1 ) ] );

		render( <Domains /> );

		await screen.findByRole( 'group', { name: 'domain01.com' } );
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

	test( 'shows 12 cards per page with pagination', async () => {
		mockApis( Array.from( { length: 13 }, ( _, index ) => mockDomain( index ) ) );

		render( <Domains /> );

		await screen.findByRole( 'group', { name: 'domain00.com' } );
		expect( domainNames() ).toHaveLength( 12 );
		expect( screen.getByRole( 'button', { name: /next page/i } ) ).toBeEnabled();
	} );

	test( 'shows the page from the URL', async () => {
		mockSearch.current = { page: '2' };
		mockApis( Array.from( { length: 13 }, ( _, index ) => mockDomain( index ) ) );

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

	test( 'switches to a table with bulk selection and tracks the change', async () => {
		const user = userEvent.setup();
		mockApis( [ mockDomain( 1 ) ] );
		const { recordTracksEvent } = render( <Domains />, { queryClient: apiQueryClient } );

		await user.click( await screen.findByRole( 'button', { name: 'Layout' } ) );
		await user.click( await screen.findByRole( 'menuitemradio', { name: /table/i } ) );

		const table = await screen.findByRole( 'table' );
		expect( within( table ).getAllByRole( 'checkbox' ).length ).toBeGreaterThan( 0 );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_dashboard_domains_view_type_changed',
			{ type: 'table' }
		);
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

	test( 'does not read a view saved in the `domains` preference', async () => {
		mockApis( [ mockDomain( 1 ) ], {
			'hosting-dashboard-dataviews-view-domains': { type: 'table', titleField: 'domain' },
		} );

		render( <Domains /> );

		await screen.findByRole( 'button', { name: 'Settings' } );
		expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
	} );

	test( 'saves view changes without touching the `domains` preference', async () => {
		const user = userEvent.setup();
		const { savedPreferences } = mockApis( [ mockDomain( 1 ) ] );
		// `userPreferenceOptimisticMutation` writes to the API package's client.
		render( <Domains />, { queryClient: apiQueryClient } );

		await user.click( await screen.findByRole( 'button', { name: 'Layout' } ) );
		await user.click( await screen.findByRole( 'menuitemradio', { name: /table/i } ) );

		await waitFor( () => expect( savedPreferences ).not.toHaveLength( 0 ) );
		expect( savedPreferences[ 0 ] ).toHaveProperty( [
			'hosting-dashboard-dataviews-view-domains-list',
		] );
		expect( savedPreferences[ 0 ] ).not.toHaveProperty( [
			'hosting-dashboard-dataviews-view-domains',
		] );
	} );
} );
