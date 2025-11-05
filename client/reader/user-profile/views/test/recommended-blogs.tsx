/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import {
	FeedRecommendation,
	useFeedRecommendationsQuery,
} from 'calypso/data/reader/use-feed-recommendations-query';
import UserRecommendedBlogs from '../recommended-blogs';
import type { UserProfileData } from 'calypso/lib/user/user';

jest.mock( '@automattic/components', () => ( {
	LoadingPlaceholder: () => <div data-testid="loading-placeholder">Loading...</div>,
} ) );

jest.mock( 'calypso/reader/recommended-feed', () => ( {
	RecommendedFeed: ( {
		blog,
		classPrefix,
	}: {
		blog: { ID: number; name: string };
		classPrefix: string;
	} ) => <li data-class-prefix={ classPrefix }>{ blog.name }</li>,
} ) );

jest.mock( 'calypso/components/empty-content', () => ( {
	__esModule: true,
	default: ( { line }: { line: string } ) => <div data-testid="empty-content">{ line }</div>,
} ) );

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
	useDispatch: jest.fn(),
} ) );

jest.mock( 'calypso/data/reader/use-feed-recommendations-query', () => ( {
	useFeedRecommendationsQuery: jest.fn(),
} ) );

describe( 'UserRecommendedBlogs', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	const defaultUser: UserProfileData = {
		ID: 123,
		user_login: 'testuser',
		display_name: 'Test User',
		avatar_URL: 'https://example.com/avatar.jpg',
	};

	const mockDispatch = jest.fn();
	const { useDispatch } = jest.requireMock( 'calypso/state' );

	beforeEach( () => {
		jest.clearAllMocks();
		useDispatch.mockReturnValue( mockDispatch );
	} );

	test( 'should render LoadingPlaceholder when no recommended blogs and still expecting request', () => {
		jest.mocked( useFeedRecommendationsQuery ).mockReturnValue( {
			data: [],
			isLoading: true,
			isFetched: false,
		} );

		render( <UserRecommendedBlogs user={ defaultUser } /> );

		const loadingPlaceholder = screen.getByTestId( 'loading-placeholder' );
		expect( loadingPlaceholder ).toBeInTheDocument();
		expect( loadingPlaceholder ).toHaveTextContent( 'Loading...' );
	} );

	test( 'should render EmptyContent when no recommended blogs and request has completed', () => {
		jest.mocked( useFeedRecommendationsQuery ).mockReturnValue( {
			data: [],
			isLoading: false,
			isFetched: true,
		} );

		render( <UserRecommendedBlogs user={ defaultUser } /> );

		const emptyContent = screen.getByTestId( 'empty-content' );
		expect( emptyContent ).toBeInTheDocument();
		expect( emptyContent ).toHaveTextContent( 'No blogs have been recommended yet.' );
	} );

	test( 'should render recommended blogs when available', () => {
		const mockRecommendedBlogs = [
			{
				ID: '1',
				name: 'Test Blog 1',
				feedId: '1',
			},
			{
				ID: '2',
				name: 'Test Blog 2',
				feedId: '2',
			},
		] as FeedRecommendation[];

		jest.mocked( useFeedRecommendationsQuery ).mockReturnValue( {
			data: mockRecommendedBlogs,
			isLoading: false,
			isFetched: true,
		} );

		render( <UserRecommendedBlogs user={ defaultUser } /> );

		expect( screen.getByText( 'Test Blog 1' ) ).toBeVisible();
		expect( screen.getByText( 'Test Blog 2' ) ).toBeVisible();
	} );
} );
