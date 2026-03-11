/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
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

		// Check if display name is rendered
		const displayNameEl = screen.getByText( defaultUser.display_name ?? '' );
		expect( displayNameEl ).toBeInTheDocument();
	} );

	test( 'should render navigation tabs with Posts, Lists, and Recommended Blogs options', () => {
		const { container } = render( <UserProfileHeader user={ defaultUser } view="posts" /> );

		// Check if navigation section is rendered
		expect( container.querySelector( '.section-nav' ) ).toBeInTheDocument();

		// Check for navigation items
		const navItems = screen.getAllByRole( 'menuitem' );
		expect( navItems.length ).toBe( 3 ); // Posts, Lists, and Recommended Blogs

		// Check nav item content - should have Posts, Lists, and Recommended Blogs
		const navTexts = navItems.map( ( item ) => item.textContent );
		expect( navTexts ).toContain( 'Posts' );
		expect( navTexts ).toContain( 'Lists' );
		expect( navTexts ).toContain( 'Recommended Blogs' );
	} );

	test( 'should not render bio section when user has no bio', () => {
		render( <UserProfileHeader user={ defaultUser } view="posts" /> );

		// Bio section should not be present
		const bioSection = document.querySelector( '.user-profile-header__bio' );
		expect( bioSection ).not.toBeInTheDocument();
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
} );
