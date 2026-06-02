/**
 * @jest-environment jsdom
 */
import {
	readSiteQuery,
	getSiteSubscriptionsQueryKey,
	getReadSiteRecommendationsInfiniteQueryKey,
} from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { QueryClient, QueryClientProvider, type InfiniteData } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import {
	getFollowingSource,
	invalidateFollowSensitiveCaches,
	patchReadSiteFollowStatus,
	patchReadSiteFollowStatusByBlogId,
	useFollowSite,
	useUnfollowSite,
} from '../use-follow-mutations';
import type {
	SiteSubscriptionItem,
	ReadSiteRecommendationsResponse,
	ReadSiteResponse,
} from '@automattic/api-core';
import type { SiteSubscriptionsInfiniteData } from '@automattic/api-queries';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';
const RECOMMENDATIONS_SEED = 1234;
const RECOMMENDATIONS_NUMBER = 4;

jest.mock( '@automattic/calypso-config', () => {
	const mockConfig = jest.fn();

	return {
		__esModule: true,
		default: mockConfig,
	};
} );

const makeQueryClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

const makeWrapper = ( queryClient: QueryClient ) => {
	const store = createStore( ( state = {} ) => state );

	return function Wrapper( { children }: { children: ReactNode } ) {
		return (
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
			</Provider>
		);
	};
};

const makeSite = ( overrides: Partial< ReadSiteResponse > = {} ): ReadSiteResponse =>
	( {
		ID: 1,
		feed_URL: 'https://example.com/feed/',
		is_following: false,
		...overrides,
	} ) as ReadSiteResponse;

const makeRecommendedSite = ( blogId: number, feedId: number ) => ( {
	blog_id: blogId,
	blog_title: `Site ${ blogId }`,
	blog_url: `https://site-${ blogId }.example.com`,
	description: `Site ${ blogId } description`,
	feed_id: feedId,
	feed_url: `https://site-${ blogId }.example.com/feed`,
	ID: blogId,
	name: `Site ${ blogId }`,
	URL: `https://site-${ blogId }.example.com`,
} );

const makeFollow = ( overrides: Partial< SiteSubscriptionItem > = {} ): SiteSubscriptionItem => ( {
	ID: 1,
	URL: 'https://example.com',
	feed_URL: 'https://example.com/feed',
	blog_ID: 1,
	feed_ID: 10,
	is_following: true,
	...overrides,
} );

const seedSiteSubscriptionsCache = (
	queryClient: QueryClient,
	subscriptions: SiteSubscriptionItem[]
) => {
	queryClient.setQueryData< SiteSubscriptionsInfiniteData >( getSiteSubscriptionsQueryKey(), {
		pageParams: [ 1 ],
		pages: [
			{
				subscriptions,
				totalCount: subscriptions.length,
				page: 1,
				number: 200,
			},
		],
	} );
};

const getCachedSiteSubscriptions = ( queryClient: QueryClient ) =>
	queryClient
		.getQueryData< SiteSubscriptionsInfiniteData >( getSiteSubscriptionsQueryKey() )
		?.pages.flatMap( ( page ) => page.subscriptions ) ?? [];

const getRecommendedSiteQueryKey = () =>
	getReadSiteRecommendationsInfiniteQueryKey( {
		seed: RECOMMENDATIONS_SEED,
		number: RECOMMENDATIONS_NUMBER,
	} );

const seedRecommendedSitesCache = ( queryClient: QueryClient ) => {
	queryClient.setQueryData< InfiniteData< ReadSiteRecommendationsResponse, number > >(
		getRecommendedSiteQueryKey(),
		{
			pageParams: [ 0 ],
			pages: [
				{
					algorithm: 'test',
					sites: [
						makeRecommendedSite( 123, 456 ),
						makeRecommendedSite( 999, 456 ),
						makeRecommendedSite( 321, 654 ),
					],
				},
			],
		}
	);
};

const getCachedRecommendedSiteIds = ( queryClient: QueryClient ) => {
	const data = queryClient.getQueryData< InfiniteData< ReadSiteRecommendationsResponse, number > >(
		getRecommendedSiteQueryKey()
	);

	return data?.pages.flatMap( ( page ) => page.sites.map( ( site ) => site.blog_id ) ) ?? [];
};

const mockConfig = config as jest.MockedFunction< typeof config >;

describe( 'follow mutation cache helpers', () => {
	beforeEach( () => {
		mockConfig.mockReset();
	} );

	afterEach( () => nock.cleanAll() );

	it( 'patchReadSiteFollowStatus updates cached read sites by matching feed_URL', () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData( [ 'read', 'sites', 1 ], makeSite() );
		queryClient.setQueryData(
			[ 'read', 'sites', 2 ],
			makeSite( { ID: 2, feed_URL: 'https://other.example/feed/' } )
		);

		patchReadSiteFollowStatus( queryClient, 'https://example.com/feed', true );

		expect(
			queryClient.getQueryData< ReadSiteResponse >( [ 'read', 'sites', 1 ] )?.is_following
		).toBe( true );
		expect(
			queryClient.getQueryData< ReadSiteResponse >( [ 'read', 'sites', 2 ] )?.is_following
		).toBe( false );
	} );

	it( 'patchReadSiteFollowStatusByBlogId updates the read site query for numeric blog IDs', () => {
		const queryClient = makeQueryClient();
		const queryKey = readSiteQuery( 123 ).queryKey;
		queryClient.setQueryData( queryKey, makeSite( { ID: 123 } ) );

		patchReadSiteFollowStatusByBlogId( queryClient, '123', true );

		expect( queryClient.getQueryData< ReadSiteResponse >( queryKey )?.is_following ).toBe( true );
	} );

	it( 'invalidateFollowSensitiveCaches invalidates follows and follow-sensitive read caches', async () => {
		const queryClient = makeQueryClient();
		const queryKeys = [
			getSiteSubscriptionsQueryKey(),
			[ 'read', 'stream', 'following' ],
			[ 'read', 'stream', 'infinite', 'following' ],
			[ 'read', 'subscriptions-count' ],
		] as const;

		for ( const queryKey of queryKeys ) {
			queryClient.setQueryData( queryKey, { value: queryKey.join( ':' ) } );
		}

		await invalidateFollowSensitiveCaches( queryClient );

		for ( const queryKey of queryKeys ) {
			expect( queryClient.getQueryState( queryKey )?.isInvalidated ).toBe( true );
		}
	} );

	it( 'getFollowingSource reads the configured following source', () => {
		mockConfig.mockReturnValue( 'test-follow-source' );

		expect( getFollowingSource() ).toBe( 'test-follow-source' );
		expect( mockConfig ).toHaveBeenCalledWith( 'readerFollowingSource' );
	} );

	it( 'useFollowSite removes a followed recommended site and matching feed duplicates from the cache', async () => {
		const queryClient = makeQueryClient();
		seedRecommendedSitesCache( queryClient );
		const scope = nock( BASE )
			.post( '/rest/v1.1/read/following/mine/new' )
			.reply( 200, {
				subscribed: true,
				subscription: {
					ID: '1',
					URL: 'https://site-123.example.com',
					feed_URL: 'https://site-123.example.com/feed',
					blog_ID: '123',
					feed_ID: '456',
				},
			} );

		const { result } = renderHook(
			() =>
				useFollowSite( {
					siteId: 123,
					seed: RECOMMENDATIONS_SEED,
					siteTitle: 'Site 123',
				} ),
			{ wrapper: makeWrapper( queryClient ) }
		);

		act( () => {
			result.current.mutate( { feedUrl: 'https://site-123.example.com/feed' } );
		} );

		await waitFor( () => expect( scope.isDone() ).toBe( true ) );
		await waitFor( () => expect( getCachedRecommendedSiteIds( queryClient ) ).toEqual( [ 321 ] ) );
	} );

	it( 'useFollowSite optimistically marks the requested feed as following', async () => {
		const queryClient = makeQueryClient();
		nock( BASE ).post( '/rest/v1.1/read/following/mine/new' ).delay( 100 ).reply( 500, {
			error: 'follow_failed',
		} );

		const { result } = renderHook( () => useFollowSite(), {
			wrapper: makeWrapper( queryClient ),
		} );

		act( () => {
			result.current.mutate( { feedUrl: 'https://example.com/feed' } );
		} );

		await waitFor( () =>
			expect( getCachedSiteSubscriptions( queryClient ) ).toMatchObject( [
				{
					feed_URL: 'https://example.com/feed',
					is_following: true,
				},
			] )
		);

		await waitFor( () => expect( result.current.isError ).toBe( true ) );
	} );

	it( 'useFollowSite rolls back the optimistic follow when the request fails', async () => {
		const queryClient = makeQueryClient();
		nock( BASE ).post( '/rest/v1.1/read/following/mine/new' ).reply( 500, {
			error: 'follow_failed',
		} );

		const { result } = renderHook( () => useFollowSite(), {
			wrapper: makeWrapper( queryClient ),
		} );

		act( () => {
			result.current.mutate( { feedUrl: 'https://example.com/feed' } );
		} );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );

		expect( getCachedSiteSubscriptions( queryClient ) ).toEqual( [] );
	} );

	it( 'useUnfollowSite optimistically marks the requested feed as not following', async () => {
		const queryClient = makeQueryClient();
		seedSiteSubscriptionsCache( queryClient, [ makeFollow() ] );
		nock( BASE ).post( '/rest/v1.1/read/following/mine/delete' ).delay( 100 ).reply( 500, {
			error: 'unfollow_failed',
		} );

		const { result } = renderHook( () => useUnfollowSite(), {
			wrapper: makeWrapper( queryClient ),
		} );

		act( () => {
			result.current.mutate( { feedUrl: 'https://example.com/feed' } );
		} );

		await waitFor( () =>
			expect( getCachedSiteSubscriptions( queryClient )[ 0 ] ).toMatchObject( {
				feed_URL: 'https://example.com/feed',
				is_following: false,
			} )
		);

		await waitFor( () => expect( result.current.isError ).toBe( true ) );
	} );

	it( 'useUnfollowSite rolls back the optimistic unfollow when the request fails', async () => {
		const queryClient = makeQueryClient();
		seedSiteSubscriptionsCache( queryClient, [ makeFollow() ] );
		nock( BASE ).post( '/rest/v1.1/read/following/mine/delete' ).reply( 500, {
			error: 'unfollow_failed',
		} );

		const { result } = renderHook( () => useUnfollowSite(), {
			wrapper: makeWrapper( queryClient ),
		} );

		act( () => {
			result.current.mutate( { feedUrl: 'https://example.com/feed' } );
		} );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );

		expect( getCachedSiteSubscriptions( queryClient )[ 0 ] ).toMatchObject( {
			feed_URL: 'https://example.com/feed',
			is_following: true,
		} );
	} );

	it( 'useFollowSite keeps a recommended site in the cache when the follow fails', async () => {
		const queryClient = makeQueryClient();
		seedRecommendedSitesCache( queryClient );
		nock( BASE ).post( '/rest/v1.1/read/following/mine/new' ).reply( 500, {
			error: 'follow_failed',
		} );

		const { result } = renderHook(
			() =>
				useFollowSite( {
					siteId: 123,
					seed: RECOMMENDATIONS_SEED,
					siteTitle: 'Site 123',
				} ),
			{ wrapper: makeWrapper( queryClient ) }
		);

		act( () => {
			result.current.mutate( { feedUrl: 'https://site-123.example.com/feed' } );
		} );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );

		expect( getCachedRecommendedSiteIds( queryClient ) ).toEqual( [ 123, 999, 321 ] );
	} );
} );
