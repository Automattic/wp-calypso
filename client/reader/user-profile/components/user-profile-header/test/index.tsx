/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { render, screen } from '@testing-library/react';
import React from 'react';
import { UserData } from 'calypso/lib/user/user';
import UserProfileHeader from '../index';

jest.mock( '@wordpress/icons', () => ( {
	external: 'mock-external-icon',
	Icon: ( { icon } ) => <span data-testid="icon">{ icon }</span>,
} ) );

jest.mock( 'calypso/blocks/reader-avatar', () => ( { author, iconSize } ) => (
	<div data-testid="reader-avatar" data-author-id={ author.ID } data-icon-size={ iconSize }>
		{ author.avatar_URL && <img src={ author.avatar_URL } alt="avatar" data-testid="avatar-img" /> }
	</div>
) );

jest.mock( 'calypso/components/section-nav', () => ( { children } ) => (
	<div data-testid="section-nav">{ children }</div>
) );

jest.mock( 'calypso/components/section-nav/tabs', () => ( { children } ) => (
	<div data-testid="nav-tabs">{ children }</div>
) );

jest.mock( 'calypso/components/section-nav/item', () => ( { children, path, selected } ) => (
	<a href={ path } data-testid="nav-item" data-selected={ selected ? 'true' : 'false' }>
		{ children }
	</a>
) );

describe( 'UserProfileHeader', () => {
	const defaultUser: UserData = {
		ID: 123,
		user_login: 'testuser',
		display_name: 'Test User',
		avatar_URL: 'https://example.com/avatar.jpg',
		profile_URL: 'https://wordpress.com/testuser',
		bio: undefined,
	};

	test( 'should render the avatar with correct user information', () => {
		render( <UserProfileHeader user={ defaultUser } /> );

		const avatars = screen.getAllByTestId( 'reader-avatar' );
		expect( avatars[ 0 ] ).toBeInTheDocument();
		expect( avatars[ 0 ] ).toHaveAttribute( 'data-author-id', defaultUser.ID.toString() );

		// Test that desktop and mobile versions are properly rendered
		const desktopAvatar = screen.getByTestId( 'desktop-avatar' );
		expect( desktopAvatar ).toBeInTheDocument();

		const mobileAvatar = screen.getByTestId( 'mobile-avatar' );
		expect( mobileAvatar ).toBeInTheDocument();
	} );

	test( 'should render the user display name', () => {
		render( <UserProfileHeader user={ defaultUser } /> );

		// Check if display name is rendered
		const displayNameEl = screen.getByText( defaultUser.display_name ?? '' );
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( displayNameEl ).toBeInTheDocument();
	} );

	test( 'should render navigation tabs with Posts and Lists options', () => {
		render( <UserProfileHeader user={ defaultUser } /> );

		// Check if navigation section is rendered
		expect( screen.getByTestId( 'section-nav' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'nav-tabs' ) ).toBeInTheDocument();

		// Check for navigation items
		const navItems = screen.getAllByTestId( 'nav-item' );
		expect( navItems.length ).toBe( 2 ); // Posts and Lists

		// Check nav item content - should have Posts and Lists
		const navTexts = navItems.map( ( item ) => item.textContent );
		expect( navTexts ).toContain( 'Posts' );
		expect( navTexts ).toContain( 'Lists' );
	} );

	test( 'should not render bio section when user has no bio', () => {
		render( <UserProfileHeader user={ defaultUser } /> );

		// Bio section should not be present
		const bioSection = document.querySelector( '.user-profile-header__bio' );
		expect( bioSection ).not.toBeInTheDocument();
	} );

	test( 'should render bio section when user has a bio', () => {
		const userWithBio = {
			...defaultUser,
			bio: 'This is my test biography that describes me as a test user.',
		};

		render( <UserProfileHeader user={ userWithBio } /> );

		// Bio section should be present
		const bioText = screen.getByText( userWithBio.bio );
		expect( bioText ).toBeInTheDocument();
	} );
} );
