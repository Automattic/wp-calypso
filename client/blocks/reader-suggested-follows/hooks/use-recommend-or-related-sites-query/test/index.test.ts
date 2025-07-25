/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useFeedRecommendationsQuery } from 'calypso/data/reader/use-feed-recommendations-query';
import { useRelatedSites } from 'calypso/data/reader/use-related-sites';
import { useRecommendOrRelatedSitesQuery } from '..';

const fakeAuthor = { wpcom_login: 'test', ID: '123', name: 'Test' };

jest.mock( 'calypso/data/reader/use-feed-recommendations-query' );
jest.mock( 'calypso/data/reader/use-related-sites' );

describe( 'useRecommendOrRelatedSitesQuery', () => {
	beforeEach( () => {
		jest.clearAllMocks();

		jest.mocked( useFeedRecommendationsQuery ).mockReturnValue( {
			data: [],
			isLoading: false,
			isSuccess: false,
		} );

		( useRelatedSites as jest.Mock ).mockReturnValue( {
			data: [],
			isLoading: false,
			isSuccess: false,
		} );
	} );

	it( "doesn't load the data when the hook is disabled", () => {
		const { result } = renderHook( () =>
			useRecommendOrRelatedSitesQuery( { siteId: 123, postId: 456 }, { enabled: false } )
		);

		expect( result.current ).toEqual( {
			data: [],
			isLoading: false,
			isSuccess: false,
			resourceType: null,
		} );
	} );

	it( 'returns the loading state when loads the recommended feeds', () => {
		( useFeedRecommendationsQuery as jest.Mock ).mockReturnValue( {
			data: [],
			isLoading: true,
		} );

		const { result } = renderHook( () =>
			useRecommendOrRelatedSitesQuery( { author: fakeAuthor, siteId: 123, postId: 456 } )
		);
		expect( result.current ).toEqual( {
			data: [],
			isLoading: true,
			isSuccess: false,
			resourceType: null,
		} );
	} );

	it( 'returns the loading state when the recommended feeds are loading and the related sites are not loading', () => {
		( useFeedRecommendationsQuery as jest.Mock ).mockReturnValue( {
			data: [],
			isLoading: false,
			isSuccess: false,
		} );

		( useRelatedSites as jest.Mock ).mockReturnValue( {
			data: [],
			isLoading: true,
			isSuccess: false,
		} );

		const { result } = renderHook( () =>
			useRecommendOrRelatedSitesQuery( { siteId: 123, postId: 456 } )
		);

		expect( result.current ).toEqual( {
			data: [],
			isLoading: true,
			isSuccess: false,
			resourceType: null,
		} );
	} );

	it( 'returns list of recommended feeds when it is available', () => {
		const mockRecommendedFeeds = [
			{
				ID: 1,
				name: 'Recommended Feed',
				feedId: 1,
			},
		];

		( useFeedRecommendationsQuery as jest.Mock ).mockReturnValue( {
			data: mockRecommendedFeeds,
			isLoading: false,
			isSuccess: true,
		} );

		const { result } = renderHook( () =>
			useRecommendOrRelatedSitesQuery( { author: fakeAuthor, siteId: 123, postId: 456 } )
		);

		expect( result.current ).toEqual( {
			data: mockRecommendedFeeds,
			isLoading: false,
			isSuccess: true,
			resourceType: 'recommended',
		} );
	} );

	it( 'returns the list of related sites when the recommended feeds are not available', () => {
		const mockRelatedSites = [
			{
				ID: 1,
				name: 'Related Site',
				feedId: 1,
			},
		];

		( useFeedRecommendationsQuery as jest.Mock ).mockReturnValue( {
			data: [],
			isLoading: false,
			isSuccess: false,
		} );

		( useRelatedSites as jest.Mock ).mockReturnValue( {
			data: mockRelatedSites,
			isLoading: false,
			isSuccess: true,
		} );

		const { result } = renderHook( () =>
			useRecommendOrRelatedSitesQuery( { siteId: 123, postId: 456 } )
		);

		expect( result.current ).toEqual( {
			data: mockRelatedSites,
			isLoading: false,
			isSuccess: true,
			resourceType: 'related',
		} );
	} );
} );
