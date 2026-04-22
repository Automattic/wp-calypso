/**
 * @jest-environment jsdom
 */

import { ReaderUser, UserSitesResponse } from '@automattic/api-core';
import { isEnabled } from '@automattic/calypso-config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { ComponentProps } from 'react';
import UserAvatar from 'calypso/blocks/user-avatar';
import UserProfileHeader from '../index';

jest.mock(
	'calypso/blocks/user-avatar',
	() =>
		( { user }: { user: ComponentProps< typeof UserAvatar >[ 'user' ] } ) => (
			<div data-testid="user-avatar" data-user-id={ user?.ID }></div>
		)
);

jest.mock( 'calypso/blocks/site-icon', () => ( {
	SiteIcon: ( { siteId }: { siteId: number } ) => <span data-testid={ `site-icon-${ siteId }` } />,
} ) );

jest.mock(
	'calypso/components/section-nav/tabs',
	() =>
		( { children }: { children: React.ReactNode } ) => (
			<div data-testid="nav-tabs">{ children }</div>
		)
);

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

const mockIsEnabled = isEnabled as jest.MockedFunction< typeof isEnabled >;

describe( 'UserProfileHeader', () => {
	const defaultUser: ReaderUser = {
		ID: 123,
		user_login: 'test_user',
		nice_name: 'nice_name',
		first_name: 'First',
		last_name: 'Last',
		display_name: 'Test User',
		avatar_URL: 'https://example.com/avatar.jpg',
		profile_URL: 'https://wordpress.com/testuser',
		description: 'This is a test user biography.',
	};

	let queryClient: QueryClient;

	beforeEach( () => {
		jest.clearAllMocks();
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

	function nockGetUserSites( userId: number, response: UserSitesResponse ) {
		return nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/users/${ userId }/sites` )
			.query( true )
			.reply( 200, response );
	}

	test( 'should render the avatar with correct user information', () => {
		renderWithClient( <UserProfileHeader user={ defaultUser } view="posts" /> );

		const avatar = screen.getByTestId( 'user-avatar' );
		expect( avatar ).toBeVisible();
		expect( avatar ).toHaveAttribute( 'data-user-id', defaultUser.ID.toString() );
	} );

	test( 'should render the user display name', () => {
		renderWithClient( <UserProfileHeader user={ defaultUser } view="posts" /> );

		const displayNameEl = screen.getByText( defaultUser.display_name ?? '' );
		expect( displayNameEl ).toBeVisible();
	} );

	test( 'should render top sites of the user', async () => {
		const mockSites: UserSitesResponse[ 'sites' ] = [
			{
				ID: 1,
				name: 'Site 1',
				description: '',
				feed_ID: 101,
				URL: 'https://site1.com',
				icon: { img: 'https://site1.com/icon.png' },
				is_following: false,
				last_published: '2024-01-01',
				posts_count: 10,
				subscribers_count: 50,
			},
			{
				ID: 2,
				name: 'Site 2',
				description: '',
				feed_ID: 102,
				URL: 'https://site2.com',
				icon: { img: 'https://site2.com/icon.png' },
				is_following: false,
				last_published: '2024-01-02',
				posts_count: 20,
				subscribers_count: 30,
			},
		];

		nockGetUserSites( defaultUser.ID, {
			sites: mockSites,
			total: mockSites.length,
			primary_site_id: 1,
		} );

		renderWithClient( <UserProfileHeader user={ defaultUser } view="posts" /> );

		for ( const site of mockSites ) {
			const siteNameEl = await screen.findByText( site.name );
			expect( siteNameEl ).toBeVisible();

			const siteIcon = screen.getByTestId( `site-icon-${ site.ID }` );
			expect( siteIcon ).toBeVisible();
		}
	} );

	test( 'should render navigation tabs with Posts, Sites, Lists, and Recommended Blogs options', () => {
		mockIsEnabled.mockReturnValue( false );
		renderWithClient( <UserProfileHeader user={ defaultUser } view="posts" /> );

		const navItems = screen.getAllByRole( 'menuitem' );
		expect( navItems.length ).toBe( 4 );

		expect( screen.getByRole( 'menuitem', { name: 'Posts' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'Sites' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'Lists' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'Recommended Blogs' } ) ).toBeVisible();
		expect( screen.queryByRole( 'menuitem', { name: 'Achievements' } ) ).not.toBeInTheDocument();
	} );

	test( 'should render Achievements tab when reader/achievements flag is enabled', () => {
		mockIsEnabled.mockImplementation( ( flag ) => flag === 'reader/achievements' );
		renderWithClient( <UserProfileHeader user={ defaultUser } view="posts" /> );

		const navItems = screen.getAllByRole( 'menuitem' );
		expect( navItems.length ).toBe( 5 );

		expect( screen.getByRole( 'menuitem', { name: 'Achievements' } ) ).toBeVisible();
	} );

	test( 'should not render bio section when user has no bio', () => {
		const userWithNoBio: ReaderUser = { ...defaultUser, description: '' };

		renderWithClient( <UserProfileHeader user={ userWithNoBio } view="posts" /> );

		expect( screen.queryByText( /show more/i ) ).not.toBeInTheDocument();
	} );

	test( 'should render bio section when user has a bio', () => {
		const userWithBio: ReaderUser = {
			...defaultUser,
			description: 'This is my test biography that describes me as a test user.',
		};

		renderWithClient( <UserProfileHeader user={ userWithBio } view="posts" /> );

		// Bio section should be present
		const bioText = screen.getByText( userWithBio.description );
		expect( bioText ).toBeVisible();
	} );

	test( 'should render Gravatar badge when user has profile_URL', () => {
		renderWithClient( <UserProfileHeader user={ defaultUser } view="posts" /> );

		const gravatarBadge = screen.getByRole( 'link', { name: /gravatar/i } );
		expect( gravatarBadge ).toBeVisible();
		expect( gravatarBadge ).toHaveAttribute( 'href', defaultUser.profile_URL );

		const gravatarIcon = screen.getByRole( 'img', { name: /gravatar badge./i } );
		expect( gravatarIcon ).toBeVisible();
	} );

	test( 'should not render Gravatar badge when user does not have profile_URL', () => {
		const userWithoutGravatarProfile: ReaderUser = {
			...defaultUser,
			profile_URL: '',
		};

		renderWithClient( <UserProfileHeader user={ userWithoutGravatarProfile } view="posts" /> );

		expect( screen.queryByRole( 'link', { name: /gravatar/i } ) ).not.toBeInTheDocument();
	} );

	test( 'should show "Show more" button for long bio and expand on click', async () => {
		const longBio = 'This is a very long biography that spans multiple lines. '.repeat( 10 ).trim();
		const userWithLongBio: ReaderUser = { ...defaultUser, description: longBio };

		const { rerender } = renderWithClient(
			<UserProfileHeader user={ userWithLongBio } view="posts" />
		);

		const bioDesc = screen.getByText( longBio );
		expect( bioDesc ).toBeVisible();
		expect( screen.queryByText( /show more/i ) ).not.toBeInTheDocument();

		// Mock scrollHeight to simulate overflow (needed for useLayoutEffect check)
		Object.defineProperty( bioDesc, 'scrollHeight', { value: 200, configurable: true } );
		Object.defineProperty( bioDesc, 'clientHeight', { value: 60, configurable: true } );

		// Re-render with slightly different bio to trigger useLayoutEffect
		rerender(
			<QueryClientProvider client={ queryClient }>
				<UserProfileHeader
					user={ { ...userWithLongBio, description: longBio + '.' } }
					view="posts"
				/>
			</QueryClientProvider>
		);

		const showMoreButton = screen.getByText( /show more/i );
		expect( showMoreButton ).toBeVisible();
		expect( bioDesc ).toHaveClass( 'is-clamped' );

		await userEvent.click( showMoreButton );

		expect( bioDesc ).toHaveClass( 'is-expanded' );
		expect( screen.getByText( /show less/i ) ).toBeVisible();
	} );
} );
