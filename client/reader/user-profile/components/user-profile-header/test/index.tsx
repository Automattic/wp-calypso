/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import { UserData } from 'calypso/lib/user/user';
import UserProfileHeader from '../index';

// Mock external icon
jest.mock( '@wordpress/icons', () => ( {
	external: 'mock-external-icon',
	Icon: ( { icon } ) => <span data-testid="icon">{ icon }</span>,
} ) );

// Mock ReaderAvatar component
jest.mock( 'calypso/blocks/reader-avatar', () => ( {
	__esModule: true,
	default: ( { author, iconSize } ) => (
		<div data-testid="reader-avatar" data-author-id={ author.ID } data-icon-size={ iconSize }>
			{ author.avatar_URL && (
				<img src={ author.avatar_URL } alt="avatar" data-testid="avatar-img" />
			) }
		</div>
	),
} ) );

// Mock SectionNav components
jest.mock( 'calypso/components/section-nav', () => ( {
	__esModule: true,
	default: ( { children } ) => <div data-testid="section-nav">{ children }</div>,
} ) );

// Mock SectionNav/Tabs component
jest.mock( 'calypso/components/section-nav/tabs', () => ( {
	__esModule: true,
	default: ( { children } ) => <div data-testid="nav-tabs">{ children }</div>,
} ) );

// Mock SectionNav/Item component
jest.mock( 'calypso/components/section-nav/item', () => ( {
	__esModule: true,
	default: ( { children, path, selected } ) => (
		<a href={ path } data-testid="nav-item" data-selected={ selected ? 'true' : 'false' }>
			{ children }
		</a>
	),
} ) );

describe( 'UserProfileHeader', () => {
	const defaultUser: UserData = {
		ID: 123,
		user_login: 'testuser',
		display_name: 'Test User',
		avatar_URL: 'https://example.com/avatar.jpg',
		profile_URL: 'https://wordpress.com/testuser',
		bio: undefined,
	};

	/**
	 * Test: Avatar rendering
	 *
	 * Verifies that:
	 * 1. The avatar component is rendered with correct props
	 * 2. The correct user data is passed to the avatar component
	 */
	test( 'should render the avatar with correct user information', () => {
		render( <UserProfileHeader user={ defaultUser } /> );

		const avatars = screen.getAllByTestId( 'reader-avatar' );
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( avatars[ 0 ] ).toBeInTheDocument();
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( avatars[ 0 ] ).toHaveAttribute( 'data-author-id', defaultUser.ID.toString() );

		// Test that desktop and mobile versions are properly rendered
		const desktopAvatar = document.querySelector(
			'.user-profile-header__avatar-desktop [data-testid="reader-avatar"]'
		);
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( desktopAvatar ).toBeInTheDocument();

		const mobileAvatar = document.querySelector(
			'.user-profile-header__avatar-mobile [data-testid="reader-avatar"]'
		);
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( mobileAvatar ).toBeInTheDocument();
	} );

	/**
	 * Test: Display name rendering
	 *
	 * Verifies that:
	 * 1. The user's display name is shown in the header
	 */
	test( 'should render the user display name', () => {
		render( <UserProfileHeader user={ defaultUser } /> );

		// Check if display name is rendered
		const displayNameEl = screen.getByText( defaultUser.display_name ?? '' );
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( displayNameEl ).toBeInTheDocument();

		expect(
			displayNameEl.closest( '[class*="user-profile-header__display-name"]' )
			// @ts-expect-error -- jest-dom matchers are available globally
		).toBeInTheDocument();
	} );

	/**
	 * Test: Navigation rendering
	 *
	 * Verifies that:
	 * 1. The navigation tabs are rendered with Posts and Lists options
	 */
	test( 'should render navigation tabs with Posts and Lists options', () => {
		render( <UserProfileHeader user={ defaultUser } /> );

		// Check if navigation section is rendered
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( screen.getByTestId( 'section-nav' ) ).toBeInTheDocument();
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( screen.getByTestId( 'nav-tabs' ) ).toBeInTheDocument();

		// Check for navigation items
		const navItems = screen.getAllByTestId( 'nav-item' );
		expect( navItems.length ).toBe( 2 ); // Posts and Lists

		// Check nav item content - should have Posts and Lists
		const navTexts = navItems.map( ( item ) => item.textContent );
		expect( navTexts ).toContain( 'Posts' );
		expect( navTexts ).toContain( 'Lists' );
	} );

	/**
	 * Test: Bio not rendered when not provided
	 *
	 * Verifies that:
	 * 1. Bio section is not rendered when user has no bio
	 */
	test( 'should not render bio section when user has no bio', () => {
		render( <UserProfileHeader user={ defaultUser } /> );

		// Bio section should not be present
		const bioSection = document.querySelector( '.user-profile-header__bio' );
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( bioSection ).not.toBeInTheDocument();
	} );

	/**
	 * Test: Bio rendering
	 *
	 * Verifies that:
	 * 1. Bio section is rendered when user has a bio
	 * 2. The bio text is displayed correctly
	 */
	test( 'should render bio section when user has a bio', () => {
		const userWithBio = {
			...defaultUser,
			bio: 'This is my test biography that describes me as a test user.',
		};

		render( <UserProfileHeader user={ userWithBio } /> );

		// Bio section should be present
		const bioText = screen.getByText( userWithBio.bio );
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( bioText ).toBeInTheDocument();
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( bioText.closest( '[class*="user-profile-header__bio"]' ) ).toBeInTheDocument();
	} );

	/**
	 * Test: Bio with profile URL
	 *
	 * Verifies that:
	 * 1. Read More link is displayed when bio is long and profile URL exists
	 */
	test( 'should render Read More link for long bio with profile URL', () => {
		// Create a long bio that will likely be clamped
		const longBio =
			'This is a very long biography that will definitely exceed the three lines limit and therefore should display the Read More link. '.repeat(
				5
			);
		const userWithLongBio = {
			...defaultUser,
			bio: longBio,
		};

		// We need to mock Element.scrollHeight and Element.offsetHeight to simulate text being clamped
		Object.defineProperty( HTMLElement.prototype, 'scrollHeight', {
			configurable: true,
			get: function () {
				// Return a large value for bio text element to simulate clamping
				if ( this.classList.contains( 'user-profile-header__bio-desc-text' ) ) {
					return 200;
				}
				return 100;
			},
		} );

		render( <UserProfileHeader user={ userWithLongBio } /> );

		// "Read More" link should be present for long bio
		const readMoreLink = screen.getByText( 'Read More' );
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( readMoreLink ).toBeInTheDocument();
		expect( readMoreLink.getAttribute( 'href' ) ).toBe( userWithLongBio.profile_URL ?? '' );

		// External icon should be displayed
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( screen.getByTestId( 'icon' ) ).toBeInTheDocument();
	} );
} );
