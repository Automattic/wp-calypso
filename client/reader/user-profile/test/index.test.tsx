/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { UserProfile, UserProfileProps } from '../index';
import type { UserResponse } from '@automattic/api-core';

jest.mock( '@automattic/calypso-router', () => ( {
	replace: jest.fn(),
	current: '/reader/users/testuser',
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

jest.mock( 'calypso/reader/user-profile/views/recommended-blogs', () => () => (
	<div data-testid="user-recommended-blogs">User Recommended Blogs</div>
) );

jest.mock( 'calypso/reader/components/back-button', () => () => (
	<button data-testid="back-button">Back</button>
) );

jest.mock(
	'calypso/reader/components/reader-main',
	() =>
		( { children }: { children: React.ReactNode } ) => (
			<div data-testid="reader-main">{ children }</div>
		)
);

describe( 'UserProfile', () => {
	const defaultProps: UserProfileProps = {
		userLogin: 'testuser',
		userId: '',
		path: '/reader/users/testuser',
		view: 'posts',
	};
	const defaultUserResponse: UserResponse = {
		ID: 123,
		user_login: 'testuser',
		display_name: 'Test User',
		avatar_URL: 'https://example.com/avatar.jpg',
		first_name: '',
		last_name: '',
		nice_name: '',
		description: '',
		profile_URL: '',
		primary_blog: null,
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

	function nockGetUser( userLogin: string, response: UserResponse | number ) {
		const scope = nock( 'https://public-api.wordpress.com' ).get(
			`/rest/v1.1/users/${ userLogin }`
		);

		if ( typeof response === 'number' ) {
			return scope.reply( response, { error: 'not_found', message: 'User not found' } );
		}

		return scope.reply( 200, response );
	}

	test( 'should render empty content when user is not found', async () => {
		nockGetUser( 'testuser', 404 );

		renderWithClient( <UserProfile { ...defaultProps } /> );

		expect( await screen.findByRole( 'heading', { name: 'User not found.' } ) ).toBeVisible();
	} );

	test( 'should render user profile when user is available', async () => {
		nockGetUser( 'testuser', defaultUserResponse );

		renderWithClient( <UserProfile { ...defaultProps } /> );

		expect( await screen.findByTestId( 'user-profile-header' ) ).toBeVisible();
		expect( screen.getByTestId( 'user-posts' ) ).toBeVisible();
	} );

	test( 'should render lists view when view is lists', async () => {
		nockGetUser( 'testuser', defaultUserResponse );

		renderWithClient(
			<UserProfile { ...defaultProps } view="lists" path="/reader/users/testuser/lists" />
		);

		expect( await screen.findByTestId( 'user-profile-header' ) ).toBeVisible();
		expect( screen.getByTestId( 'user-lists' ) ).toBeVisible();
	} );

	test( 'should render recommended-blogs view when view is recommended-blogs', async () => {
		nockGetUser( 'testuser', defaultUserResponse );

		renderWithClient(
			<UserProfile
				{ ...defaultProps }
				view="recommended-blogs"
				path="/reader/users/testuser/recommended-blogs"
			/>
		);

		expect( await screen.findByTestId( 'user-profile-header' ) ).toBeVisible();
		expect( screen.getByTestId( 'user-recommended-blogs' ) ).toBeVisible();
	} );

	test( 'should not show content when isLoading is true', () => {
		renderWithClient( <UserProfile { ...defaultProps } /> );

		expect( screen.queryByRole( 'heading', { name: 'User not found.' } ) ).not.toBeInTheDocument();
		expect( screen.queryByTestId( 'user-profile-header' ) ).not.toBeInTheDocument();
	} );

	test( 'should redirect from user ID path to user login path when user is loaded', async () => {
		nockGetUser( 'testuser', defaultUserResponse );

		renderWithClient( <UserProfile { ...defaultProps } path="/reader/users/id/123" /> );

		await waitFor( () => {
			expect( page.replace ).toHaveBeenCalledWith( '/reader/users/testuser' );
		} );
	} );
} );
