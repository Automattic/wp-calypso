/**
 * @jest-environment jsdom
 */
import { ReaderUser, UserSitesResponse } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import nock from 'nock';
import { ReaderSite } from 'calypso/reader/sites-list/site-item';
import UserSites from '..';

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
} ) );

// Mocking ReaderSitesList because it uses useDispatch internally which would require a full Redux store setup.
jest.mock( 'calypso/reader/sites-list', () => ( {
	ReaderSitesList: ( { sites }: { sites: ReaderSite[] } ) => (
		<div data-testid="reader-sites-list">
			{ sites.map( ( site ) => (
				<p key={ site.siteId }>{ site.name }</p>
			) ) }
		</div>
	),
} ) );

describe( 'UserSites', () => {
	const { useSelector } = jest.requireMock( 'calypso/state' );
	const defaultUser: ReaderUser = {
		ID: 123,
		user_login: 'test_user',
		nice_name: 'nice_name',
		display_name: 'Test User',
		avatar_URL: 'https://example.com/avatar.jpg',
		first_name: '',
		last_name: '',
		description: '',
		profile_URL: '',
	};

	let queryClient: QueryClient;

	beforeEach( () => {
		jest.clearAllMocks();
		useSelector.mockReturnValue( null );
		nock.disableNetConnect();
		queryClient = new QueryClient( {
			defaultOptions: {
				queries: { retry: false },
			},
		} );
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	function renderWithClient( ui: React.ReactNode ) {
		return render( <QueryClientProvider client={ queryClient }>{ ui }</QueryClientProvider> );
	}

	function nockGetUserSites( userId: number, response: UserSitesResponse | number ) {
		const scope = nock( 'https://public-api.wordpress.com' ).get(
			`/wpcom/v2/users/${ userId }/sites`
		);

		if ( typeof response === 'number' ) {
			return scope.query( true ).reply( response, { error: 'error', message: 'Error' } );
		}

		return scope.query( true ).reply( 200, response );
	}

	test( 'should render Spinner when fetching sites', () => {
		// Rendering without awaiting the nock response.
		renderWithClient( <UserSites user={ defaultUser } /> );

		expect( screen.getByText( 'Loading sites' ) ).toBeVisible();
	} );

	test( 'should render error message when fetch fails', async () => {
		nockGetUserSites( defaultUser.ID, 500 );

		renderWithClient( <UserSites user={ defaultUser } /> );

		expect( await screen.findByText( 'Sorry, something went wrong.' ) ).toBeVisible();
	} );

	test( 'should render EmptyContent when no sites available', async () => {
		nockGetUserSites( defaultUser.ID, { sites: [], total: 0, primary_site_id: 0 } );

		renderWithClient( <UserSites user={ defaultUser } /> );

		expect( await screen.findByText( 'No sites have been created yet.' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'link', { name: 'Create your first site' } )
		).not.toBeInTheDocument();
	} );

	test( 'should show "Create your first site" button when viewing own empty profile', async () => {
		useSelector.mockReturnValue( { username: 'test_user' } );

		nockGetUserSites( defaultUser.ID, { sites: [], total: 0, primary_site_id: 0 } );

		renderWithClient( <UserSites user={ defaultUser } /> );

		const createSiteButton = await screen.findByRole( 'link', { name: 'Create your first site' } );
		expect( createSiteButton ).toBeVisible();
		expect( createSiteButton ).toHaveAttribute(
			'href',
			'/start?source=reader&ref=user-profile-page'
		);
	} );

	test( 'should render sites list when sites are available', async () => {
		const mockSites: UserSitesResponse[ 'sites' ] = [
			{
				ID: 1,
				name: 'Test Site 1',
				description: 'A test site',
				feed_ID: 101,
				URL: 'https://test1.wordpress.com',
				icon: { img: 'https://example.com/icon1.png' },
				is_following: false,
				last_published: '2024-01-01',
				posts_count: 10,
				subscribers_count: 100,
			},
			{
				ID: 2,
				name: 'Test Site 2',
				description: 'Another test site',
				feed_ID: 102,
				URL: 'https://test2.wordpress.com',
				icon: { ico: 'https://example.com/icon2.ico' },
				is_following: true,
				last_published: '2024-01-02',
				posts_count: 20,
				subscribers_count: 200,
			},
		];

		nockGetUserSites( defaultUser.ID, { sites: mockSites, total: 2, primary_site_id: 1 } );

		renderWithClient( <UserSites user={ defaultUser } /> );

		const sitesList = await screen.findByTestId( 'reader-sites-list' );
		expect( sitesList ).toBeVisible();
		expect( screen.getByText( 'Test Site 1' ) ).toBeVisible();
		expect( screen.getByText( 'Test Site 2' ) ).toBeVisible();
	} );

	test( 'should not render sites flagged as hidden for a public viewer', async () => {
		const mockSites: UserSitesResponse[ 'sites' ] = [
			{
				ID: 1,
				name: 'Visible Site',
				description: '',
				feed_ID: 101,
				URL: 'https://visible.wordpress.com',
				icon: {},
				is_following: false,
				last_published: '2024-01-01',
				posts_count: 10,
				subscribers_count: 100,
			},
			{
				ID: 2,
				name: 'Hidden Site',
				description: '',
				feed_ID: 102,
				URL: 'https://hidden.wordpress.com',
				icon: {},
				is_following: false,
				last_published: '2024-01-02',
				posts_count: 20,
				subscribers_count: 200,
				is_hidden: true,
			},
		];

		nockGetUserSites( defaultUser.ID, { sites: mockSites, total: 2, primary_site_id: 1 } );

		renderWithClient( <UserSites user={ defaultUser } /> );

		expect( await screen.findByText( 'Visible Site' ) ).toBeVisible();
		expect( screen.queryByText( 'Hidden Site' ) ).not.toBeInTheDocument();
	} );

	test( "should exclude the owner's hidden sites based on their preference", async () => {
		useSelector.mockReturnValue( { username: 'test_user' } );

		const mockSites: UserSitesResponse[ 'sites' ] = [
			{
				ID: 1,
				name: 'Kept Site',
				description: '',
				feed_ID: 101,
				URL: 'https://kept.wordpress.com',
				icon: {},
				is_following: false,
				last_published: '2024-01-01',
				posts_count: 10,
				subscribers_count: 100,
			},
			{
				ID: 2,
				name: 'Owner Hidden Site',
				description: '',
				feed_ID: 102,
				URL: 'https://owner-hidden.wordpress.com',
				icon: {},
				is_following: false,
				last_published: '2024-01-02',
				posts_count: 20,
				subscribers_count: 200,
			},
		];

		nockGetUserSites( defaultUser.ID, { sites: mockSites, total: 2, primary_site_id: 1 } );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/preferences' )
			.reply( 200, { calypso_preferences: { 'reader-profile-hidden-sites': [ 2 ] } } );

		renderWithClient( <UserSites user={ defaultUser } /> );

		expect( await screen.findByText( 'Kept Site' ) ).toBeVisible();
		expect( screen.queryByText( 'Owner Hidden Site' ) ).not.toBeInTheDocument();
	} );
} );
