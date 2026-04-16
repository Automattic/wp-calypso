/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfileData } from 'calypso/lib/user/user';
import useUserSitesQuery from 'calypso/reader/user-profile/queries/use-user-sites-query';
import UserProfileHeader from '../index';

jest.mock( 'calypso/blocks/user-avatar', () => ( { user }: { user: UserProfileData } ) => (
	<div data-testid="user-avatar" data-user-id={ user?.ID }></div>
) );

jest.mock( 'calypso/blocks/site-icon', () => ( {
	SiteIcon: ( { siteId }: { siteId: number } ) => <span data-testid={ `site-icon-${ siteId }` } />,
} ) );

jest.mock( 'calypso/reader/user-profile/queries/use-user-sites-query', () => ( {
	__esModule: true,
	default: jest.fn(),
} ) );

jest.mock(
	'calypso/components/section-nav/tabs',
	() =>
		( { children }: { children: React.ReactNode } ) => (
			<div data-testid="nav-tabs">{ children }</div>
		)
);

describe( 'UserProfileHeader', () => {
	const defaultUser: UserProfileData = {
		ID: 123,
		user_login: 'testuser',
		first_name: 'First',
		last_name: 'Last',
		display_name: 'Test User',
		avatar_URL: 'https://example.com/avatar.jpg',
		profile_URL: 'https://wordpress.com/testuser',
		description: 'This is a test user biography.',
		primary_blog: null,
		recommended_blogs_count: 0,
	};

	jest.mocked( useUserSitesQuery ).mockReturnValue( {
		isFetching: true,
		data: undefined,
		error: null,
	} as ReturnType< typeof useUserSitesQuery > );

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'should render the avatar with correct user information', () => {
		render( <UserProfileHeader user={ defaultUser } view="posts" /> );

		const avatar = screen.getByTestId( 'user-avatar' );
		expect( avatar ).toBeVisible();
		expect( avatar ).toHaveAttribute( 'data-user-id', defaultUser.ID.toString() );
	} );

	test( 'should render the user display name', () => {
		render( <UserProfileHeader user={ defaultUser } view="posts" /> );

		const displayNameEl = screen.getByText( defaultUser.display_name ?? '' );
		expect( displayNameEl ).toBeVisible();
	} );

	test( 'should render top sites of the user', () => {
		const mockSites = [
			{
				ID: 1,
				name: 'Site 1',
				feed_ID: 101,
				URL: 'https://site1.com',
				icon: { img: 'https://site1.com/icon.png' },
				subscribers_count: 50,
			},
			{
				ID: 2,
				name: 'Site 2',
				feed_ID: 102,
				URL: 'https://site2.com',
				icon: { img: 'https://site2.com/icon.png' },
				subscribers_count: 30,
			},
		];

		jest.mocked( useUserSitesQuery ).mockReturnValue( {
			isFetching: false,
			data: { sites: mockSites, total: mockSites.length, primary_site_id: 1 },
			error: null,
		} as ReturnType< typeof useUserSitesQuery > );

		render( <UserProfileHeader user={ defaultUser } view="posts" /> );

		mockSites.forEach( ( site ) => {
			const siteNameEl = screen.getByText( site.name );
			expect( siteNameEl ).toBeVisible();

			const siteIcon = screen.getByTestId( `site-icon-${ site.ID }` );
			expect( siteIcon ).toBeVisible();
		} );
	} );

	test( 'should render navigation tabs with Posts, Sites, Lists, and Recommended Blogs options', () => {
		render( <UserProfileHeader user={ defaultUser } view="posts" /> );

		const navItems = screen.getAllByRole( 'menuitem' );
		expect( navItems.length ).toBe( 4 );

		expect( screen.getByRole( 'menuitem', { name: 'Posts' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'Sites' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'Lists' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'Recommended Blogs' } ) ).toBeVisible();
	} );

	test( 'should not render bio section when user has no bio', () => {
		render( <UserProfileHeader user={ defaultUser } view="posts" /> );

		expect( screen.queryByText( /show more/i ) ).not.toBeInTheDocument();
	} );

	test( 'should render bio section when user has a bio', () => {
		const userWithBio: UserProfileData = {
			...defaultUser,
			description: 'This is my test biography that describes me as a test user.',
		};

		render( <UserProfileHeader user={ userWithBio } view="posts" /> );

		// Bio section should be present
		const bioText = screen.getByText( userWithBio.description );
		expect( bioText ).toBeVisible();
	} );

	test( 'should render Gravatar badge when user has profile_URL', () => {
		render( <UserProfileHeader user={ defaultUser } view="posts" /> );

		const gravatarBadge = screen.getByRole( 'link', { name: /gravatar/i } );
		expect( gravatarBadge ).toBeVisible();
		expect( gravatarBadge ).toHaveAttribute( 'href', defaultUser.profile_URL );

		const gravatarIcon = screen.getByRole( 'img', { name: /gravatar badge./i } );
		expect( gravatarIcon ).toBeVisible();
	} );

	test( 'should not render Gravatar badge when user does not have profile_URL', () => {
		const userWithoutGravatarProfile: UserProfileData = {
			...defaultUser,
			profile_URL: '',
		};

		render( <UserProfileHeader user={ userWithoutGravatarProfile } view="posts" /> );

		expect( screen.queryByRole( 'link', { name: /gravatar/i } ) ).not.toBeInTheDocument();
	} );

	test( 'should show "Show more" button for long bio and expand on click', async () => {
		const longBio = 'This is a very long biography that spans multiple lines. '.repeat( 10 ).trim();
		const userWithLongBio: UserProfileData = { ...defaultUser, description: longBio };

		const { rerender } = render( <UserProfileHeader user={ userWithLongBio } view="posts" /> );

		const bioDesc = screen.getByText( longBio );
		expect( bioDesc ).toBeVisible();
		expect( screen.queryByText( /show more/i ) ).not.toBeInTheDocument();

		// Mock scrollHeight to simulate overflow (needed for useLayoutEffect check)
		Object.defineProperty( bioDesc, 'scrollHeight', { value: 200, configurable: true } );
		Object.defineProperty( bioDesc, 'clientHeight', { value: 60, configurable: true } );
		// Re-render with slightly different bio to trigger useLayoutEffect
		rerender(
			<UserProfileHeader user={ { ...userWithLongBio, description: longBio + '.' } } view="posts" />
		);

		const showMoreButton = screen.getByText( /show more/i );
		expect( showMoreButton ).toBeVisible();
		expect( bioDesc ).toHaveClass( 'is-clamped' );

		await userEvent.click( showMoreButton );

		expect( bioDesc ).toHaveClass( 'is-expanded' );
		expect( screen.getByText( /show less/i ) ).toBeVisible();
	} );
} );
