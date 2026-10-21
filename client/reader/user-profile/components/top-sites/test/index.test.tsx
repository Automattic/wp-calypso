/**
 * @jest-environment jsdom
 */
import { UserSitesResponse } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import UserTopSites from '..';

jest.mock( 'calypso/blocks/site-icon', () => ( {
	SiteIcon: ( { siteId }: { siteId: number } ) => <span data-testid={ `site-icon-${ siteId }` } />,
} ) );

describe( 'UserTopSites', () => {
	const defaultProps = {
		userId: 123,
		userLogin: 'test_user',
	};

	let queryClient: QueryClient;

	beforeEach( () => {
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

	test( 'should render skeleton when fetching', () => {
		// Set up a nock that won't reply immediately (no async await), keeping the query in loading state.
		nockGetUserSites( defaultProps.userId, { sites: [], total: 0, primary_site_id: 0 } );

		const { container } = renderWithClient( <UserTopSites { ...defaultProps } /> );

		expect( container.querySelectorAll( '.skeleton' ) ).toHaveLength( 2 );
	} );

	test( 'should return null when there is an error', async () => {
		nockGetUserSites( defaultProps.userId, 500 );

		const { container } = renderWithClient( <UserTopSites { ...defaultProps } /> );

		await waitFor( () => {
			expect( container.querySelector( '.skeleton' ) ).not.toBeInTheDocument();
		} );
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'should return null when there are no sites', async () => {
		nockGetUserSites( defaultProps.userId, { sites: [], total: 0, primary_site_id: 0 } );

		const { container } = renderWithClient( <UserTopSites { ...defaultProps } /> );

		await waitFor( () => {
			expect( container.querySelector( '.skeleton' ) ).not.toBeInTheDocument();
		} );
		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'should render primary site and top 2 subscribed sites', async () => {
		const mockSites: UserSitesResponse[ 'sites' ] = [
			{
				ID: 1,
				name: 'Primary Site',
				description: 'Primary',
				feed_ID: 101,
				URL: 'https://primary.wordpress.com',
				icon: { img: 'https://example.com/icon1.png' },
				is_following: false,
				last_published: '2024-01-01',
				posts_count: 10,
				subscribers_count: 50,
			},
			{
				ID: 2,
				name: 'Site With Most Subscribers',
				description: 'Most popular',
				feed_ID: 102,
				URL: 'https://popular.wordpress.com',
				icon: { img: 'https://example.com/icon2.png' },
				is_following: false,
				last_published: '2024-01-02',
				posts_count: 20,
				subscribers_count: 500,
			},
			{
				ID: 3,
				name: 'Site With Least Subscribers',
				description: 'Least popular',
				feed_ID: 103,
				URL: 'https://least.wordpress.com',
				icon: { img: 'https://example.com/icon3.png' },
				is_following: false,
				last_published: '2024-01-03',
				posts_count: 5,
				subscribers_count: 10,
			},
			{
				ID: 4,
				name: 'Site With Medium Subscribers',
				description: 'Medium popular',
				feed_ID: 104,
				URL: 'https://medium.wordpress.com',
				icon: { img: 'https://example.com/icon4.png' },
				is_following: false,
				last_published: '2024-01-04',
				posts_count: 15,
				subscribers_count: 100,
			},
		];

		nockGetUserSites( defaultProps.userId, { sites: mockSites, total: 4, primary_site_id: 1 } );

		renderWithClient( <UserTopSites { ...defaultProps } /> );

		// Primary site should always be shown
		expect( await screen.findByText( 'Primary Site' ) ).toBeVisible();

		// Top 2 subscribed sites (excluding primary) should be shown
		expect( screen.getByText( 'Site With Most Subscribers' ) ).toBeVisible();
		expect( screen.getByText( 'Site With Medium Subscribers' ) ).toBeVisible();

		// Least subscribed site should NOT be shown (only top 2)
		expect( screen.queryByText( 'Site With Least Subscribers' ) ).not.toBeInTheDocument();
	} );

	test( 'should show "+N" link when more than 3 sites exist', async () => {
		const mockSites: UserSitesResponse[ 'sites' ] = [
			{
				ID: 1,
				name: 'Site 1',
				description: '',
				feed_ID: 101,
				URL: 'https://site1.wordpress.com',
				icon: {},
				is_following: false,
				last_published: '2024-01-01',
				posts_count: 10,
				subscribers_count: 100,
			},
			{
				ID: 2,
				name: 'Site 2',
				description: '',
				feed_ID: 102,
				URL: 'https://site2.wordpress.com',
				icon: {},
				is_following: false,
				last_published: '2024-01-02',
				posts_count: 20,
				subscribers_count: 200,
			},
			{
				ID: 3,
				name: 'Site 3',
				description: '',
				feed_ID: 103,
				URL: 'https://site3.wordpress.com',
				icon: {},
				is_following: false,
				last_published: '2024-01-03',
				posts_count: 30,
				subscribers_count: 300,
			},
			{
				ID: 4,
				name: 'Site 4',
				description: '',
				feed_ID: 104,
				URL: 'https://site4.wordpress.com',
				icon: {},
				is_following: false,
				last_published: '2024-01-04',
				posts_count: 40,
				subscribers_count: 400,
			},
			{
				ID: 5,
				name: 'Site 5',
				description: '',
				feed_ID: 105,
				URL: 'https://site5.wordpress.com',
				icon: {},
				is_following: false,
				last_published: '2024-01-05',
				posts_count: 50,
				subscribers_count: 500,
			},
		];

		nockGetUserSites( defaultProps.userId, { sites: mockSites, total: 5, primary_site_id: 1 } );

		renderWithClient( <UserTopSites { ...defaultProps } /> );

		const moreLink = await screen.findByRole( 'link', { name: '+2' } );
		expect( moreLink ).toBeVisible();
		expect( moreLink ).toHaveAttribute( 'href', '/reader/users/test_user/sites' );
	} );

	test( 'should not show "+N" link when 3 or fewer sites exist', async () => {
		const mockSites: UserSitesResponse[ 'sites' ] = [
			{
				ID: 1,
				name: 'Site 1',
				description: '',
				feed_ID: 101,
				URL: 'https://site1.wordpress.com',
				icon: {},
				is_following: false,
				last_published: '2024-01-01',
				posts_count: 10,
				subscribers_count: 100,
			},
			{
				ID: 2,
				name: 'Site 2',
				description: '',
				feed_ID: 102,
				URL: 'https://site2.wordpress.com',
				icon: {},
				is_following: false,
				last_published: '2024-01-02',
				posts_count: 20,
				subscribers_count: 200,
			},
		];

		nockGetUserSites( defaultProps.userId, { sites: mockSites, total: 2, primary_site_id: 1 } );

		renderWithClient( <UserTopSites { ...defaultProps } /> );

		await screen.findByText( 'Site 1' );
		expect( screen.queryByText( /^\+\d+$/ ) ).not.toBeInTheDocument();
	} );

	test( 'should link to feed when feedId is available', async () => {
		const mockSites: UserSitesResponse[ 'sites' ] = [
			{
				ID: 1,
				name: 'Site With Feed',
				description: '',
				feed_ID: 101,
				URL: 'https://site.wordpress.com',
				icon: {},
				is_following: false,
				last_published: '2024-01-01',
				posts_count: 10,
				subscribers_count: 100,
			},
		];

		nockGetUserSites( defaultProps.userId, { sites: mockSites, total: 1, primary_site_id: 1 } );

		renderWithClient( <UserTopSites { ...defaultProps } /> );

		const siteLink = await screen.findByRole( 'link', { name: /Site With Feed/ } );
		expect( siteLink ).toHaveAttribute( 'href', '/reader/feeds/101' );
	} );

	test( 'should link to blog when feedId is not available but siteId is', async () => {
		const mockSites: UserSitesResponse[ 'sites' ] = [
			{
				ID: 1,
				name: 'Site Without Feed',
				description: '',
				feed_ID: 0,
				URL: 'https://site.wordpress.com',
				icon: {},
				is_following: false,
				last_published: '2024-01-01',
				posts_count: 10,
				subscribers_count: 100,
			},
		];

		nockGetUserSites( defaultProps.userId, { sites: mockSites, total: 1, primary_site_id: 1 } );

		renderWithClient( <UserTopSites { ...defaultProps } /> );

		const siteLink = await screen.findByRole( 'link', { name: /Site Without Feed/ } );
		expect( siteLink ).toHaveAttribute( 'href', '/reader/blogs/1' );
	} );

	test( 'should link to feed URL when both feedId and siteId are not available but URL is', async () => {
		const mockSites: UserSitesResponse[ 'sites' ] = [
			{
				ID: 0,
				name: 'URL Only Site',
				description: '',
				feed_ID: 0,
				URL: 'https://site.wordpress.com',
				icon: {},
				is_following: false,
				last_published: '2024-01-01',
				posts_count: 10,
				subscribers_count: 100,
			},
		];

		nockGetUserSites( defaultProps.userId, { sites: mockSites, total: 1, primary_site_id: 1 } );

		renderWithClient( <UserTopSites { ...defaultProps } /> );

		const siteLink = await screen.findByRole( 'link', { name: /URL Only Site/ } );
		expect( siteLink ).toHaveAttribute( 'href', 'https://site.wordpress.com' );
	} );

	test( "should exclude the owner's hidden sites based on their preference", async () => {
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
			},
		];

		nockGetUserSites( defaultProps.userId, { sites: mockSites, total: 2, primary_site_id: 1 } );
		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/me/preferences' )
			.reply( 200, { calypso_preferences: { 'reader-profile-hidden-sites': [ 2 ] } } );

		renderWithClient( <UserTopSites { ...defaultProps } isOwnProfile /> );

		expect( await screen.findByText( 'Visible Site' ) ).toBeVisible();
		expect( screen.queryByText( 'Hidden Site' ) ).not.toBeInTheDocument();
	} );
} );
