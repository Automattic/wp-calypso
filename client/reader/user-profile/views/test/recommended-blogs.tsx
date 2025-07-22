/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import React from 'react';
import { UserData } from 'calypso/lib/user/user';
import UserRecommendedBlogs from '../recommended-blogs';

jest.mock( '@automattic/components', () => ( {
	LoadingPlaceholder: () => <div data-testid="loading-placeholder">Loading...</div>,
} ) );

jest.mock(
	'calypso/components/gravatar-with-hovercards/recommended-blogs/item',
	() =>
		( { blog, classPrefix }: { blog: { ID: number; name: string }; classPrefix: string } ) => (
			<li
				data-testid="recommended-blog-item"
				data-blog-id={ blog.ID }
				data-class-prefix={ classPrefix }
			>
				{ blog.name }
			</li>
		)
);

jest.mock( 'calypso/components/empty-content', () => ( {
	__esModule: true,
	default: ( { line }: { line: string } ) => <div data-testid="empty-content">{ line }</div>,
} ) );

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
	useDispatch: jest.fn(),
} ) );

jest.mock( 'calypso/state/reader/lists/actions', () => ( {
	requestUserRecommendedBlogs: jest.fn(),
} ) );

jest.mock( 'calypso/state/reader/lists/selectors', () => ( {
	isRequestingUserRecommendedBlogs: jest.fn(),
	hasRequestedUserRecommendedBlogs: jest.fn(),
	getUserRecommendedBlogs: jest.fn(),
} ) );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( text: string ) => text,
} ) );

describe( 'UserRecommendedBlogs', () => {
	const defaultUser: UserData = {
		ID: 123,
		user_login: 'testuser',
		display_name: 'Test User',
		avatar_URL: 'https://example.com/avatar.jpg',
	};

	const mockDispatch = jest.fn();
	const mockGetUserRecommendedBlogs = jest.requireMock(
		'calypso/state/reader/lists/selectors'
	).getUserRecommendedBlogs;
	const mockIsRequestingUserRecommendedBlogs = jest.requireMock(
		'calypso/state/reader/lists/selectors'
	).isRequestingUserRecommendedBlogs;
	const mockHasRequestedUserRecommendedBlogs = jest.requireMock(
		'calypso/state/reader/lists/selectors'
	).hasRequestedUserRecommendedBlogs;
	const { useSelector, useDispatch } = jest.requireMock( 'calypso/state' );

	beforeEach( () => {
		jest.clearAllMocks();
		useDispatch.mockReturnValue( mockDispatch );
		useSelector.mockImplementation( ( selector: ( state: unknown ) => unknown ) => {
			// Mock the selector calls based on the selector function
			if ( selector.toString().includes( 'isRequestingUserRecommendedBlogs' ) ) {
				return mockIsRequestingUserRecommendedBlogs();
			}
			if ( selector.toString().includes( 'hasRequestedUserRecommendedBlogs' ) ) {
				return mockHasRequestedUserRecommendedBlogs();
			}
			if ( selector.toString().includes( 'getUserRecommendedBlogs' ) ) {
				return mockGetUserRecommendedBlogs();
			}
			return undefined;
		} );
		mockIsRequestingUserRecommendedBlogs.mockReturnValue( false );
		mockHasRequestedUserRecommendedBlogs.mockReturnValue( true );
		mockGetUserRecommendedBlogs.mockReturnValue( [] );
	} );

	test( 'should render LoadingPlaceholder when no recommended blogs and still expecting request', () => {
		mockGetUserRecommendedBlogs.mockReturnValue( null );
		mockIsRequestingUserRecommendedBlogs.mockReturnValue( true );
		mockHasRequestedUserRecommendedBlogs.mockReturnValue( false );

		render( <UserRecommendedBlogs user={ defaultUser } /> );

		const loadingPlaceholder = screen.getByTestId( 'loading-placeholder' );
		expect( loadingPlaceholder ).toBeInTheDocument();
		expect( loadingPlaceholder ).toHaveTextContent( 'Loading...' );
	} );

	test( 'should render LoadingPlaceholder when recommended blogs array is empty and still expecting request', () => {
		mockGetUserRecommendedBlogs.mockReturnValue( [] );
		mockIsRequestingUserRecommendedBlogs.mockReturnValue( true );
		mockHasRequestedUserRecommendedBlogs.mockReturnValue( false );

		render( <UserRecommendedBlogs user={ defaultUser } /> );

		const loadingPlaceholder = screen.getByTestId( 'loading-placeholder' );
		expect( loadingPlaceholder ).toBeInTheDocument();
		expect( loadingPlaceholder ).toHaveTextContent( 'Loading...' );
	} );

	test( 'should render LoadingPlaceholder when no recommended blogs and not yet requested', () => {
		mockGetUserRecommendedBlogs.mockReturnValue( null );
		mockIsRequestingUserRecommendedBlogs.mockReturnValue( false );
		mockHasRequestedUserRecommendedBlogs.mockReturnValue( false );

		render( <UserRecommendedBlogs user={ defaultUser } /> );

		const loadingPlaceholder = screen.getByTestId( 'loading-placeholder' );
		expect( loadingPlaceholder ).toBeInTheDocument();
		expect( loadingPlaceholder ).toHaveTextContent( 'Loading...' );
	} );

	test( 'should render EmptyContent when no recommended blogs and request has completed', () => {
		mockGetUserRecommendedBlogs.mockReturnValue( null );
		mockIsRequestingUserRecommendedBlogs.mockReturnValue( false );
		mockHasRequestedUserRecommendedBlogs.mockReturnValue( true );

		render( <UserRecommendedBlogs user={ defaultUser } /> );

		const emptyContent = screen.getByTestId( 'empty-content' );
		expect( emptyContent ).toBeInTheDocument();
		expect( emptyContent ).toHaveTextContent( 'No blogs have been recommended yet.' );
	} );

	test( 'should render EmptyContent when recommended blogs array is empty and request has completed', () => {
		mockGetUserRecommendedBlogs.mockReturnValue( [] );
		mockIsRequestingUserRecommendedBlogs.mockReturnValue( false );
		mockHasRequestedUserRecommendedBlogs.mockReturnValue( true );

		render( <UserRecommendedBlogs user={ defaultUser } /> );

		const emptyContent = screen.getByTestId( 'empty-content' );
		expect( emptyContent ).toBeInTheDocument();
		expect( emptyContent ).toHaveTextContent( 'No blogs have been recommended yet.' );
	} );

	test( 'should render recommended blogs when available', () => {
		const mockRecommendedBlogs = [
			{
				ID: 1,
				name: 'Test Blog 1',
				URL: 'https://testblog1.com',
			},
			{
				ID: 2,
				name: 'Test Blog 2',
				URL: 'https://testblog2.com',
			},
		];

		mockGetUserRecommendedBlogs.mockReturnValue( mockRecommendedBlogs );

		render( <UserRecommendedBlogs user={ defaultUser } /> );

		// Container should be present
		const container = screen.getByRole( 'list' );
		expect( container ).toHaveClass( 'user-profile__recommended-blogs-list' );

		// Blog items should be rendered
		const blogItems = screen.getAllByTestId( 'recommended-blog-item' );
		expect( blogItems ).toHaveLength( 2 );

		// Blog names should be displayed
		expect( screen.getByText( 'Test Blog 1' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Test Blog 2' ) ).toBeInTheDocument();

		// Blog items should have correct props
		expect( blogItems[ 0 ] ).toHaveAttribute( 'data-blog-id', '1' );
		expect( blogItems[ 0 ] ).toHaveAttribute( 'data-class-prefix', 'user-profile' );
		expect( blogItems[ 1 ] ).toHaveAttribute( 'data-blog-id', '2' );
		expect( blogItems[ 1 ] ).toHaveAttribute( 'data-class-prefix', 'user-profile' );
	} );

	test( 'should request recommended blogs when not available and not yet requested', () => {
		mockGetUserRecommendedBlogs.mockReturnValue( null );
		mockHasRequestedUserRecommendedBlogs.mockReturnValue( false );

		render( <UserRecommendedBlogs user={ defaultUser } /> );

		expect( mockDispatch ).toHaveBeenCalled();
	} );
} );
