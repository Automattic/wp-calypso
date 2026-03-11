/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfileData } from 'calypso/lib/user/user';
import UserProfileHeader from '../index';

jest.mock( 'calypso/blocks/reader-avatar', () => ( { author }: { author: UserProfileData } ) => (
	<div data-testid="reader-avatar" data-author-id={ author.ID }></div>
) );

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
		display_name: 'Test User',
		avatar_URL: 'https://example.com/avatar.jpg',
		profile_URL: 'https://wordpress.com/testuser',
		bio: undefined,
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'should render the avatar with correct user information', () => {
		render( <UserProfileHeader user={ defaultUser } view="posts" /> );

		const avatar = screen.getByTestId( 'reader-avatar' );
		expect( avatar ).toBeInTheDocument();
		expect( avatar ).toHaveAttribute( 'data-author-id', defaultUser.ID.toString() );
	} );

	test( 'should render the user display name', () => {
		render( <UserProfileHeader user={ defaultUser } view="posts" /> );

		const displayNameEl = screen.getByText( defaultUser.display_name ?? '' );
		expect( displayNameEl ).toBeInTheDocument();
	} );

	test( 'should render navigation tabs with Posts, Lists, and Recommended Blogs options', () => {
		render( <UserProfileHeader user={ defaultUser } view="posts" /> );

		const navItems = screen.getAllByRole( 'menuitem' );
		expect( navItems.length ).toBe( 3 ); // Posts, Lists, and Recommended Blogs

		expect( screen.getByRole( 'menuitem', { name: 'Posts' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'menuitem', { name: 'Lists' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'menuitem', { name: 'Recommended Blogs' } ) ).toBeInTheDocument();
	} );

	test( 'should not render bio section when user has no bio', () => {
		render( <UserProfileHeader user={ defaultUser } view="posts" /> );

		expect( screen.queryByRole( 'button', { name: /show more/i } ) ).not.toBeInTheDocument();
	} );

	test( 'should render bio section when user has a bio', () => {
		const userWithBio = {
			...defaultUser,
			bio: 'This is my test biography that describes me as a test user.',
		};

		render( <UserProfileHeader user={ userWithBio } view="posts" /> );

		// Bio section should be present
		const bioText = screen.getByText( userWithBio.bio );
		expect( bioText ).toBeInTheDocument();
	} );

	test( 'should render Gravatar badge when user has profile_URL', () => {
		render( <UserProfileHeader user={ defaultUser } view="posts" /> );

		const gravatarBadge = screen.getByRole( 'link', { name: /gravatar/i } );
		expect( gravatarBadge ).toBeInTheDocument();
		expect( gravatarBadge ).toHaveAttribute( 'href', defaultUser.profile_URL );

		const gravatarIcon = screen.getByRole( 'img', { name: /gravatar/i } );
		expect( gravatarIcon ).toBeInTheDocument();
	} );

	test( 'should not render Gravatar badge when user does not have profile_URL', () => {
		const userWithoutGravatarProfile = {
			...defaultUser,
			profile_URL: undefined,
		};

		render( <UserProfileHeader user={ userWithoutGravatarProfile } view="posts" /> );

		expect( screen.queryByRole( 'link', { name: /gravatar/i } ) ).not.toBeInTheDocument();
	} );

	test( 'should show "Show more" button for long bio and expand on click', async () => {
		const longBio = 'This is a very long biography that spans multiple lines. '.repeat( 10 ).trim();
		const userWithLongBio = { ...defaultUser, bio: longBio };

		const { container, rerender } = render(
			<UserProfileHeader user={ userWithLongBio } view="posts" />
		);

		const bioDesc = container.querySelector( '.user-profile-header__bio-desc' );
		expect( bioDesc ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /show more/i } ) ).not.toBeInTheDocument();

		// Mock scrollHeight to simulate overflow (needed for useLayoutEffect check)
		Object.defineProperty( bioDesc, 'scrollHeight', { value: 200, configurable: true } );
		Object.defineProperty( bioDesc, 'clientHeight', { value: 60, configurable: true } );
		// Re-render with slightly different bio to trigger useLayoutEffect
		rerender(
			<UserProfileHeader user={ { ...userWithLongBio, bio: longBio + '.' } } view="posts" />
		);

		const showMoreButton = screen.getByRole( 'button', { name: /show more/i } );
		expect( showMoreButton ).toBeInTheDocument();
		expect( bioDesc ).toHaveClass( 'is-clamped' );

		await userEvent.click( showMoreButton );

		expect( bioDesc ).toHaveClass( 'is-expanded' );
		expect( screen.getByRole( 'button', { name: /show less/i } ) ).toBeInTheDocument();
	} );
} );
