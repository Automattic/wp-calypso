/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { UserProfile } from '../index';

/**
 * Mock the router to simulate navigation and current path
 * This allows testing the component's behavior when paths change
 */
jest.mock( '@automattic/calypso-router', () => ( {
	replace: jest.fn(),
	current: '/reader/users/testuser',
} ) );

/**
 * Mock the child components to isolate testing to just the UserProfile component
 * Each mock returns a simple div with a data-testid to verify rendering
 */
jest.mock( 'calypso/reader/user-profile/components/user-profile-header', () => ( {
	__esModule: true,
	default: () => <div data-testid="user-profile-header">User Profile Header</div>,
} ) );

jest.mock( 'calypso/reader/user-profile/views/posts', () => ( {
	__esModule: true,
	default: () => <div data-testid="user-posts">User Posts</div>,
} ) );

jest.mock( 'calypso/reader/user-profile/views/lists', () => ( {
	__esModule: true,
	default: () => <div data-testid="user-lists">User Lists</div>,
} ) );

/**
 * Mock the back button to test click handling
 * Includes onClick handler to test interaction
 */
jest.mock( 'calypso/components/back-button', () => ( {
	__esModule: true,
	default: ( { onClick } ) => (
		<button data-testid="back-button" onClick={ onClick }>
			Back
		</button>
	),
} ) );

/**
 * Mock the empty content component to test error state
 * Preserves props to verify correct error message display
 */
jest.mock( 'calypso/components/empty-content', () => ( {
	__esModule: true,
	default: ( { title, line, action } ) => (
		<div data-testid="empty-content">
			<h2>{ title }</h2>
			<p>{ line }</p>
			<button>{ action }</button>
		</div>
	),
} ) );

describe( 'UserProfile', () => {
	/**
	 * Set up mock functions and default props for all tests
	 * - mockRequestUser: Simulates API call to fetch user data
	 * - mockHandleBack: Simulates the back button click handler
	 */
	const mockRequestUser = jest.fn().mockResolvedValue( undefined );
	const mockHandleBack = jest.fn();

	const defaultProps = {
		userLogin: 'testuser',
		userId: '',
		path: '/reader/users/testuser',
		requestUser: mockRequestUser,
		user: undefined,
		isLoading: false,
		showBack: false,
		handleBack: mockHandleBack,
	};

	beforeEach( () => {
		// Reset mock function calls between tests
		jest.clearAllMocks();
	} );

	/**
	 * Test: Empty state when user is not found
	 *
	 * Verifies that:
	 * 1. The empty content component is displayed when no user data is available
	 * 2. The requestUser function is called with the correct username
	 */
	test( 'should render empty content when user is not found', () => {
		render( <UserProfile { ...defaultProps } /> );

		// @ts-expect-error -- jest-dom matchers are available globally
		expect( screen.getByTestId( 'empty-content' ) ).toBeInTheDocument();
		expect( mockRequestUser ).toHaveBeenCalledWith( 'testuser' );
	} );

	/**
	 * Test: User profile display
	 *
	 * Verifies that:
	 * 1. The user profile header is rendered when user data is available
	 * 2. The posts view is displayed (default view for the profile)
	 */
	test( 'should render user profile when user is available', () => {
		const user = {
			ID: 123,
			user_login: 'testuser',
			display_name: 'Test User',
			avatar_URL: 'https://example.com/avatar.jpg',
		};

		render( <UserProfile { ...defaultProps } user={ user } /> );

		// @ts-expect-error -- jest-dom matchers are available globally
		expect( screen.getByTestId( 'user-profile-header' ) ).toBeInTheDocument();
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( screen.getByTestId( 'user-posts' ) ).toBeInTheDocument();
	} );

	/**
	 * Test: Lists view rendering
	 *
	 * Verifies that:
	 * 1. The user profile header is rendered
	 * 2. The lists view is displayed when the path includes "/lists"
	 * This tests the component's routing logic
	 */
	test( 'should render lists view when path includes /lists', () => {
		const user = {
			ID: 123,
			user_login: 'testuser',
			display_name: 'Test User',
			avatar_URL: 'https://example.com/avatar.jpg',
		};

		render( <UserProfile { ...defaultProps } user={ user } path="/reader/users/testuser/lists" /> );

		// @ts-expect-error -- jest-dom matchers are available globally
		expect( screen.getByTestId( 'user-profile-header' ) ).toBeInTheDocument();
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( screen.getByTestId( 'user-lists' ) ).toBeInTheDocument();
	} );

	/**
	 * Test: Back button functionality
	 *
	 * Verifies that:
	 * 1. The back button is displayed when showBack prop is true
	 * 2. The handleBack callback is triggered when the back button is clicked
	 */
	test( 'should show back button when showBack is true', () => {
		const user = {
			ID: 123,
			user_login: 'testuser',
			display_name: 'Test User',
			avatar_URL: 'https://example.com/avatar.jpg',
		};

		render( <UserProfile { ...defaultProps } user={ user } showBack /> );

		const backButton = screen.getByTestId( 'back-button' );
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( backButton ).toBeInTheDocument();

		// Simulate clicking the back button
		backButton.click();
		expect( mockHandleBack ).toHaveBeenCalled();
	} );

	/**
	 * Test: Loading state
	 *
	 * Verifies that:
	 * 1. No content is displayed when the isLoading prop is true
	 * 2. Neither empty content nor profile components are rendered during loading
	 */
	test( 'should not show content when isLoading is true', () => {
		render( <UserProfile { ...defaultProps } isLoading /> );

		// @ts-expect-error -- jest-dom matchers are available globally
		expect( screen.queryByTestId( 'empty-content' ) ).not.toBeInTheDocument();
		// @ts-expect-error -- jest-dom matchers are available globally
		expect( screen.queryByTestId( 'user-profile-header' ) ).not.toBeInTheDocument();
	} );

	/**
	 * Test: Page replacement for user ID paths
	 *
	 * Verifies that:
	 * 1. When path starts with '/reader/users/id/' and user data is available
	 * 2. The page is redirected to the username-based URL
	 */
	test( 'should redirect from user ID path to user login path when user is loaded', () => {
		const user = {
			ID: 123,
			user_login: 'testuser',
			display_name: 'Test User',
			avatar_URL: 'https://example.com/avatar.jpg',
		};

		render( <UserProfile { ...defaultProps } user={ user } path="/reader/users/id/123" /> );

		// Verify the redirect was called with the correct path
		expect( page.replace ).toHaveBeenCalledWith( '/reader/users/testuser' );
	} );

	/**
	 * Test: Multiple API calls
	 *
	 * Verifies that:
	 * 1. When both userLogin and userId are provided
	 * 2. The requestUser function is called for both
	 */
	test( 'should request user data with both login and ID when provided', () => {
		render( <UserProfile { ...defaultProps } userLogin="testuser" userId="123" /> );

		// Verify both API calls were made
		expect( mockRequestUser ).toHaveBeenCalledWith( 'testuser' );
		expect( mockRequestUser ).toHaveBeenCalledWith( '123', true );
	} );
} );
