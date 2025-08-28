/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useFeedRecommendationsQuery } from 'calypso/data/reader/use-feed-recommendations-query';
import { requestUserRecommendedBlogs } from 'calypso/state/reader/lists/actions';
import {
	getUserRecommendedBlogs,
	hasRequestedUserRecommendedBlogs,
	isRequestingUserRecommendedBlogs,
} from 'calypso/state/reader/lists/selectors';
import { type AppState } from 'calypso/types';

jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: ( state: AppState ) => any ) => selector( {} as AppState ),
	useDispatch: () => jest.fn(),
} ) );

jest.mock( 'calypso/state/reader/lists/selectors', () => ( {
	getUserRecommendedBlogs: jest.fn(),
	isRequestingUserRecommendedBlogs: jest.fn(),
	hasRequestedUserRecommendedBlogs: jest.fn(),
} ) );

jest.mock( 'calypso/state/reader/lists/actions', () => ( {
	requestUserRecommendedBlogs: jest.fn(),
} ) );

describe( 'useFeedRecommendationsQuery', () => {
	beforeEach( () => {
		jest.resetAllMocks();
	} );

	it( 'returns an empty array when no recommended blogs are found', () => {
		const { result } = renderHook( () => useFeedRecommendationsQuery( 'test' ) );
		expect( result.current.data ).toEqual( [] );
	} );

	it( 'returns the correct data when recommended blogs are found', () => {
		jest.mocked( getUserRecommendedBlogs ).mockReturnValue( [
			{
				ID: '1',
				name: 'Test Blog 1',
				feedId: '1',
			},
		] );
		const { result } = renderHook( () => useFeedRecommendationsQuery( 'test' ) );
		expect( result.current.data ).toHaveLength( 1 );
	} );

	it( 'returns loading state when recommended blogs are being requested', () => {
		jest.mocked( isRequestingUserRecommendedBlogs ).mockReturnValue( true );
		const { result } = renderHook( () => useFeedRecommendationsQuery( 'test' ) );

		expect( result.current.isLoading ).toBe( true );
	} );

	it( 'requests recommended blogs when not available and not yet requested', async () => {
		const requestUserRecommendedBlogsMock = jest.fn();

		jest
			.mocked( requestUserRecommendedBlogs )
			.mockImplementation( requestUserRecommendedBlogsMock );

		jest.mocked( hasRequestedUserRecommendedBlogs ).mockReturnValue( false );

		renderHook( () => useFeedRecommendationsQuery( 'test' ) );

		expect( requestUserRecommendedBlogsMock ).toHaveBeenCalled();
	} );

	it( 'does not request recommended blogs when not available and already requested', async () => {
		const requestUserRecommendedBlogsMock = jest.fn();

		jest
			.mocked( requestUserRecommendedBlogs )
			.mockImplementation( requestUserRecommendedBlogsMock );

		jest.mocked( hasRequestedUserRecommendedBlogs ).mockReturnValue( true );

		renderHook( () => useFeedRecommendationsQuery( 'test' ) );

		expect( requestUserRecommendedBlogsMock ).not.toHaveBeenCalled();
	} );

	it( 'does not request recommended blogs when it is disabled', async () => {
		const requestUserRecommendedBlogsMock = jest.fn();
		jest.mocked( hasRequestedUserRecommendedBlogs ).mockReturnValue( false );

		jest
			.mocked( requestUserRecommendedBlogs )
			.mockImplementation( requestUserRecommendedBlogsMock );

		renderHook( () => useFeedRecommendationsQuery( 'test', { enabled: false } ) );

		expect( requestUserRecommendedBlogsMock ).not.toHaveBeenCalled();
	} );
} );
