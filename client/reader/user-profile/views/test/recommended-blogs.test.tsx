/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import {
	FeedRecommendation,
	useFeedRecommendationsQuery,
} from 'calypso/data/reader/use-feed-recommendations-query';
import { ReaderSite } from 'calypso/reader/sites-list/site-item';
import { useDispatch } from 'calypso/state';
import UserRecommendedBlogs from '../recommended-blogs';
import type { ReaderUser } from '@automattic/api-core';

vi.mock( '@automattic/components', () => ( {
	LoadingPlaceholder: () => <div data-testid="loading-placeholder">Loading...</div>,
} ) );

vi.mock( 'calypso/reader/sites-list', () => ( {
	ReaderSitesList: ( { sites }: { sites: ReaderSite[] } ) => (
		<div>
			{ sites.map( ( site, index ) => (
				<p key={ index }>{ site.name }</p>
			) ) }
		</div>
	),
} ) );

vi.mock( 'calypso/components/empty-content', () => ( {
	__esModule: true,
	default: ( { line }: { line: string } ) => <div data-testid="empty-content">{ line }</div>,
} ) );

vi.mock( 'calypso/state', () => ( {
	useSelector: vi.fn(),
	useDispatch: vi.fn(),
} ) );

vi.mock( 'calypso/data/reader/use-feed-recommendations-query', () => ( {
	useFeedRecommendationsQuery: vi.fn(),
} ) );

describe( 'UserRecommendedBlogs', () => {
	afterEach( () => {
		vi.clearAllMocks();
	} );

	const defaultUser: ReaderUser = {
		ID: 123,
		user_login: 'test_user',
		nice_name: 'nice_name',
		display_name: 'Test User',
		avatar_URL: 'https://example.com/avatar.jpg',
		first_name: '',
		last_name: '',
		description: '',
		profile_URL: '',
	};

	const mockDispatch = vi.fn();

	beforeEach( () => {
		vi.clearAllMocks();
		vi.mocked( useDispatch ).mockReturnValue( mockDispatch );
	} );

	test( 'should render LoadingPlaceholder when no recommended blogs and still expecting request', () => {
		vi.mocked( useFeedRecommendationsQuery ).mockReturnValue( {
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
		vi.mocked( useFeedRecommendationsQuery ).mockReturnValue( {
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

		vi.mocked( useFeedRecommendationsQuery ).mockReturnValue( {
			data: mockRecommendedBlogs,
			isLoading: false,
			isFetched: true,
		} );

		render( <UserRecommendedBlogs user={ defaultUser } /> );

		expect( screen.getByText( 'Test Blog 1' ) ).toBeVisible();
		expect( screen.getByText( 'Test Blog 2' ) ).toBeVisible();
	} );
} );
