/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { UserProfileData } from 'calypso/lib/user/user';
import { useReaderUserQuery } from 'calypso/reader/user-profile/queries/useReaderUserQuery';
import { UserProfile, UserProfileProps } from '../index';

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

jest.mock(
	'calypso/components/empty-content',
	() =>
		( { title, line, action }: { title: string; line: string; action: string } ) => (
			<div data-testid="empty-content">
				<h2>{ title }</h2>
				<p>{ line }</p>
				<button>{ action }</button>
			</div>
		)
);

jest.mock( 'calypso/reader/user-profile/queries/useReaderUserQuery' );

const mockUseReaderUserQuery = useReaderUserQuery as jest.MockedFunction<
	typeof useReaderUserQuery
>;

function renderWithClient( ui: React.ReactElement ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false } },
	} );
	return render( <QueryClientProvider client={ queryClient }>{ ui }</QueryClientProvider> );
}

describe( 'UserProfile', () => {
	const defaultProps: UserProfileProps = {
		userLogin: 'testuser',
		userId: '',
		path: '/reader/users/testuser',
		view: 'posts',
	};
	const defaultUser: UserProfileData = {
		ID: 123,
		user_login: 'testuser',
		display_name: 'Test User',
		avatar_URL: 'https://example.com/avatar.jpg',
		first_name: '',
		last_name: '',
		description: '',
		profile_URL: '',
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	test( 'should render empty content when user is not found', () => {
		mockUseReaderUserQuery.mockReturnValue( {
			isLoading: false,
			data: undefined,
		} as ReturnType< typeof useReaderUserQuery > );

		renderWithClient( <UserProfile { ...defaultProps } /> );

		expect( screen.getByTestId( 'empty-content' ) ).toBeVisible();
	} );

	test( 'should render user profile when user is available', () => {
		mockUseReaderUserQuery.mockReturnValue( {
			isLoading: false,
			data: {
				user: defaultUser,
			},
		} as ReturnType< typeof useReaderUserQuery > );

		renderWithClient( <UserProfile { ...defaultProps } /> );

		expect( screen.getByTestId( 'user-profile-header' ) ).toBeVisible();
		expect( screen.getByTestId( 'user-posts' ) ).toBeVisible();
	} );

	test( 'should render lists view when view is lists', () => {
		mockUseReaderUserQuery.mockReturnValue( {
			isLoading: false,
			data: {
				user: defaultUser,
			},
		} as ReturnType< typeof useReaderUserQuery > );

		renderWithClient(
			<UserProfile { ...defaultProps } view="lists" path="/reader/users/testuser/lists" />
		);

		expect( screen.getByTestId( 'user-profile-header' ) ).toBeVisible();
		expect( screen.getByTestId( 'user-lists' ) ).toBeVisible();
	} );

	test( 'should render recommended-blogs view when view is recommended-blogs', () => {
		mockUseReaderUserQuery.mockReturnValue( {
			isLoading: false,
			data: {
				user: defaultUser,
			},
		} as ReturnType< typeof useReaderUserQuery > );

		renderWithClient(
			<UserProfile
				{ ...defaultProps }
				view="recommended-blogs"
				path="/reader/users/testuser/recommended-blogs"
			/>
		);

		expect( screen.getByTestId( 'user-profile-header' ) ).toBeVisible();
		expect( screen.getByTestId( 'user-recommended-blogs' ) ).toBeVisible();
	} );

	test( 'should not show content when isLoading is true', () => {
		mockUseReaderUserQuery.mockReturnValue( {
			isLoading: true,
			data: undefined,
		} as ReturnType< typeof useReaderUserQuery > );

		renderWithClient( <UserProfile { ...defaultProps } /> );

		expect( screen.queryByTestId( 'empty-content' ) ).not.toBeInTheDocument();
		expect( screen.queryByTestId( 'user-profile-header' ) ).not.toBeInTheDocument();
	} );

	test( 'should redirect from user ID path to user login path when user is loaded', () => {
		mockUseReaderUserQuery.mockReturnValue( {
			isLoading: false,
			data: {
				user: defaultUser,
			},
		} as ReturnType< typeof useReaderUserQuery > );

		renderWithClient( <UserProfile { ...defaultProps } path="/reader/users/id/123" /> );

		expect( page.replace ).toHaveBeenCalledWith( '/reader/users/testuser' );
	} );

	test( 'should pass find_by_id param when only userId is provided', () => {
		mockUseReaderUserQuery.mockReturnValue( {
			isLoading: true,
			data: undefined,
		} as ReturnType< typeof useReaderUserQuery > );

		renderWithClient( <UserProfile { ...defaultProps } userLogin="" userId="123" /> );

		expect( mockUseReaderUserQuery ).toHaveBeenCalledWith( '123', {
			find_by_id: true,
		} );
	} );
} );
