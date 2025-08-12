/**
 * @jest-environment jsdom
 */
import { UseQueryResult } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { when } from 'jest-when';
import { useFeedRecommendationsQuery } from 'calypso/data/reader/use-feed-recommendations-query';
import { RelatedSite, useRelatedSites } from 'calypso/data/reader/use-related-sites';
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
			isFetched: false,
		} );

		( useRelatedSites as jest.Mock ).mockReturnValue( {
			data: [],
			isLoading: false,
			isFetched: false,
		} );
	} );

	it( "doesn't load the data when the hook is disabled", () => {
		const { result } = renderHook( () =>
			useRecommendOrRelatedSitesQuery( { siteId: 123, postId: 456 }, { enabled: false } )
		);

		expect( result.current ).toEqual( {
			data: [],
			isLoading: false,
			isFetched: false,
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
			isFetched: false,
			resourceType: null,
		} );
	} );

	it( 'returns the loading state when the recommended feeds are loading and the related sites are not loading', () => {
		( useFeedRecommendationsQuery as jest.Mock ).mockReturnValue( {
			data: [],
			isLoading: false,
			isFetched: false,
		} );

		( useRelatedSites as jest.Mock ).mockReturnValue( {
			data: [],
			isLoading: true,
			isFetched: false,
		} );

		const { result } = renderHook( () =>
			useRecommendOrRelatedSitesQuery( { siteId: 123, postId: 456 } )
		);

		expect( result.current ).toEqual( {
			data: [],
			isLoading: true,
			isFetched: false,
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
			isFetched: true,
		} );

		const { result } = renderHook( () =>
			useRecommendOrRelatedSitesQuery( { author: fakeAuthor, siteId: 123, postId: 456 } )
		);

		expect( result.current ).toEqual( {
			data: mockRecommendedFeeds,
			isLoading: false,
			isFetched: true,
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
			isFetched: true,
		} );

		( useRelatedSites as jest.Mock ).mockReturnValue( {
			data: mockRelatedSites,
			isLoading: false,
			isFetched: true,
		} );

		const { result } = renderHook( () =>
			useRecommendOrRelatedSitesQuery( { siteId: 123, postId: 456 } )
		);

		expect( result.current ).toEqual( {
			data: mockRelatedSites,
			isLoading: false,
			isFetched: true,
			resourceType: 'related',
		} );
	} );

	it( 'returns the related sites list when there is not a user login', () => {
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
			isFetched: false,
		} );

		//It only returns the related sites when enabled is true
		when( useRelatedSites )
			.calledWith( 123, 456, { enabled: true } )
			.mockReturnValue( {
				data: mockRelatedSites,
				isLoading: false,
				isFetched: true,
			} as unknown as UseQueryResult< RelatedSite[] | null > );

		const { result } = renderHook( () =>
			useRecommendOrRelatedSitesQuery( { siteId: 123, postId: 456 } )
		);

		expect( result.current ).toEqual( {
			data: mockRelatedSites,
			isLoading: false,
			isFetched: true,
			resourceType: 'related',
		} );
	} );

	it( 'returns an empty array when there is no recommended or related sites', () => {
		( useFeedRecommendationsQuery as jest.Mock ).mockReturnValue( {
			data: [],
			isLoading: false,
			isFetched: true,
		} );

		( useRelatedSites as jest.Mock ).mockReturnValue( {
			data: [],
			isLoading: false,
			isFetched: true,
		} );

		const { result } = renderHook( () =>
			useRecommendOrRelatedSitesQuery( { siteId: 123, postId: 456 } )
		);

		expect( result.current ).toEqual( {
			data: [],
			isLoading: false,
			isFetched: true,
			resourceType: null,
		} );
	} );
} );
