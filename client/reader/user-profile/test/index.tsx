/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore } from 'redux';
import { UserProfile, UserProfileProps } from '../index';

// Create a Redux store with initial state where user is logged in
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initialState: any = {
	currentUser: { id: 123 }, // This makes isUserLoggedIn return true
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store = createStore( ( state: any = initialState ) => state );

jest.mock( '@automattic/calypso-router', () => ( {
	replace: jest.fn(),
	current: '/reader/users/testuser',
	lastRoute: '/reader', // This makes userHasHistory return true
} ) );

// Mock shouldShowBackButton to ensure it returns true for our test
jest.mock( 'calypso/reader/controller-helper', () => ( {
	...jest.requireActual( 'calypso/reader/controller-helper' ),
	shouldShowBackButton: () => true,
	userHasHistory: () => true,
} ) );

jest.mock( 'calypso/reader/user-profile/components/user-profile-header', () => () => (
	<div data-testid="user-profile-header">User Profile Header</div>
) );

jest.mock( 'calypso/reader/user-profile/views/posts', () => () => (
	<div data-testid="user-posts">User Posts</div>
) );

jest.mock( 'calypso/reader/user-profile/views/lists', () => () => (
	<div data-testid="user-lists">User Lists</div>
) );

jest.mock( 'calypso/components/back-button', () => ( { onClick } ) => (
	<button data-testid="back-button" onClick={ onClick }>
		Back
	</button>
) );

jest.mock( 'calypso/components/empty-content', () => ( { title, line, action } ) => (
	<div data-testid="empty-content">
		<h2>{ title }</h2>
		<p>{ line }</p>
		<button>{ action }</button>
	</div>
) );

describe( 'UserProfile', () => {
	const mockRequestUser = jest.fn().mockResolvedValue( undefined );
	const mockHandleBack = jest.fn();

	const defaultProps: UserProfileProps = {
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

	const renderWithProvider = ( ui ) => {
		return render( <Provider store={ store }>{ ui }</Provider> );
	};

	test( 'should render empty content when user is not found', () => {
		renderWithProvider( <UserProfile { ...defaultProps } /> );

		expect( screen.getByTestId( 'empty-content' ) ).toBeInTheDocument();
		expect( mockRequestUser ).toHaveBeenCalledWith( 'testuser' );
	} );

	test( 'should render user profile when user is available', () => {
		const user = {
			ID: 123,
			user_login: 'testuser',
			display_name: 'Test User',
			avatar_URL: 'https://example.com/avatar.jpg',
		};

		renderWithProvider( <UserProfile { ...defaultProps } user={ user } /> );

		expect( screen.getByTestId( 'user-profile-header' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'user-posts' ) ).toBeInTheDocument();
	} );

	test( 'should render lists view when path includes /lists', () => {
		const user = {
			ID: 123,
			user_login: 'testuser',
			display_name: 'Test User',
			avatar_URL: 'https://example.com/avatar.jpg',
		};

		renderWithProvider(
			<UserProfile { ...defaultProps } user={ user } path="/reader/users/testuser/lists" />
		);

		expect( screen.getByTestId( 'user-profile-header' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'user-lists' ) ).toBeInTheDocument();
	} );

	test( 'should show back button when showBack is true', () => {
		const user = {
			ID: 123,
			user_login: 'testuser',
			display_name: 'Test User',
			avatar_URL: 'https://example.com/avatar.jpg',
		};

		renderWithProvider( <UserProfile { ...defaultProps } user={ user } showBack /> );

		const backButton = screen.getByTestId( 'back-button' );
		expect( backButton ).toBeInTheDocument();

		// Simulate clicking the back button
		backButton.click();
		expect( mockHandleBack ).toHaveBeenCalled();
	} );

	test( 'should not show content when isLoading is true', () => {
		renderWithProvider( <UserProfile { ...defaultProps } isLoading /> );

		expect( screen.queryByTestId( 'empty-content' ) ).not.toBeInTheDocument();
		expect( screen.queryByTestId( 'user-profile-header' ) ).not.toBeInTheDocument();
	} );

	test( 'should redirect from user ID path to user login path when user is loaded', () => {
		const user = {
			ID: 123,
			user_login: 'testuser',
			display_name: 'Test User',
			avatar_URL: 'https://example.com/avatar.jpg',
		};

		renderWithProvider(
			<UserProfile { ...defaultProps } user={ user } path="/reader/users/id/123" />
		);

		// Verify the redirect was called with the correct path
		expect( page.replace ).toHaveBeenCalledWith( '/reader/users/testuser' );
	} );

	test( 'should request user data with both login and ID when provided', () => {
		renderWithProvider( <UserProfile { ...defaultProps } userLogin="testuser" userId="123" /> );

		// Verify both API calls were made
		expect( mockRequestUser ).toHaveBeenCalledWith( 'testuser' );
		expect( mockRequestUser ).toHaveBeenCalledWith( '123', true );
	} );
} );
