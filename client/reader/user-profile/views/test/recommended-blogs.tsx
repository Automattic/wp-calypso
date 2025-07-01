/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { render, screen } from '@testing-library/react';
import React from 'react';
import { UserData } from 'calypso/lib/user/user';
import UserRecommendedBlogs from '../recommended-blogs';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

jest.mock(
	'calypso/components/gravatar-with-hovercards/recommended-blogs/item',
	() =>
		( { blog, classPrefix } ) => (
			<li
				data-testid="recommended-blog-item"
				data-blog-id={ blog.ID }
				data-class-prefix={ classPrefix }
			>
				{ blog.name }
			</li>
		)
);

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
	useDispatch: jest.fn(),
} ) );

jest.mock( 'calypso/state/reader/lists/actions', () => ( {
	requestUserRecommendedBlogs: jest.fn(),
} ) );

jest.mock( 'calypso/state/reader/lists/selectors', () => ( {
	getUserRecommendedBlogs: jest.fn(),
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
	const mockIsEnabled = jest.requireMock( '@automattic/calypso-config' ).isEnabled;
	const { useSelector, useDispatch } = jest.requireMock( 'calypso/state' );

	beforeEach( () => {
		jest.clearAllMocks();
		useDispatch.mockReturnValue( mockDispatch );
		useSelector.mockImplementation( ( selector ) => selector( {} ) );
		mockIsEnabled.mockReturnValue( true );
	} );

	test( 'should render nothing when feature flag is disabled', () => {
		mockIsEnabled.mockReturnValue( false );
		mockGetUserRecommendedBlogs.mockReturnValue( [] );

		const { container } = render( <UserRecommendedBlogs user={ defaultUser } /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'should render nothing when no recommended blogs are available', () => {
		mockGetUserRecommendedBlogs.mockReturnValue( null );

		const { container } = render( <UserRecommendedBlogs user={ defaultUser } /> );

		expect( container ).toBeEmptyDOMElement();
	} );

	test( 'should render nothing when recommended blogs array is empty', () => {
		mockGetUserRecommendedBlogs.mockReturnValue( [] );

		const { container } = render( <UserRecommendedBlogs user={ defaultUser } /> );

		expect( container ).toBeEmptyDOMElement();
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

	test( 'should request recommended blogs when not available', () => {
		mockGetUserRecommendedBlogs.mockReturnValue( null );

		render( <UserRecommendedBlogs user={ defaultUser } /> );

		expect( mockDispatch ).toHaveBeenCalled();
	} );
} );
