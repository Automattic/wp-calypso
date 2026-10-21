/**
 * @jest-environment jsdom
 */
import { getReadSiteRecommendationsInfiniteQueryKey } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	removeRecommendedSiteFromAllCaches,
	removeRecommendedSiteFromCache,
	selectVisibleRecommendedSites,
	useDismissRecommendedSite,
	useRecommendedSites,
} from '..';
import type { RecommendedSite } from '..';
import type { ReadSiteRecommendationsResponse } from '@automattic/api-core';
import type { InfiniteData } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';

function makeClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

function makeWrapper( client: QueryClient ) {
	return function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};
}

function railcar( id: number ) {
	return {
		railcar: `railcar-${ id }`,
		fetch_algo: 'algo',
		fetch_lang: 'en',
		fetch_position: id,
		rec_blog_id: String( id ),
	};
}

function recommendedSite( blogId: number, feedId = blogId * 10 ) {
	return {
		algorithm: 'algo',
		blogId,
		description: `Site ${ blogId }`,
		feedId,
		feedUrl: `https://site-${ blogId }.test/feed`,
		icon: '',
		railcar: railcar( blogId ),
		title: `Site ${ blogId }`,
		url: `https://site-${ blogId }.test`,
	};
}

function apiSite( blogId: number, feedId = blogId * 10 ) {
	return {
		blog_id: blogId,
		description: `Site ${ blogId }`,
		feed_id: feedId,
		feed_url: `https://site-${ blogId }.test/feed`,
		ID: blogId,
		name: `Site ${ blogId }`,
		railcar: {},
		URL: `https://site-${ blogId }.test`,
	};
}

const appendRecommendedSitesToCache = (
	queryClient: QueryClient,
	{ seed, number }: { seed: number; number: number },
	sites: RecommendedSite[]
) => {
	const queryKey = getReadSiteRecommendationsInfiniteQueryKey( { seed, number } );
	queryClient.setQueryData< InfiniteData< ReadSiteRecommendationsResponse, number > >(
		queryKey,
		( current ) => {
			const page: ReadSiteRecommendationsResponse = {
				algorithm: sites[ 0 ]?.algorithm ?? '',
				sites: sites.map( ( site ) => ( {
					blog_id: site.blogId,
					blog_title: site.title,
					blog_url: site.url,
					description: site.description,
					feed_id: site.feedId,
					feed_url: site.feedUrl,
					icon: { img: site.icon },
					ID: site.blogId,
					name: site.title,
					railcar: site.railcar,
					URL: site.url,
				} ) ),
			};

			if ( ! current ) {
				return { pageParams: [ 0 ], pages: [ page ] };
			}

			return {
				...current,
				pages: [ ...current.pages, page ],
				pageParams: [
					...current.pageParams,
					( current.pageParams[ current.pageParams.length - 1 ] ?? 0 ) + number,
				],
			};
		}
	);
};

describe( 'recommended-sites Reader data helpers', () => {
	afterEach( () => nock.cleanAll() );

	it( 'appends recommendations and dedupes by feedId', () => {
		const client = makeClient();

		appendRecommendedSitesToCache( client, { seed: 7, number: 2 }, [
			{
				algorithm: 'algo',
				blogId: 1,
				description: 'One',
				feedId: 10,
				feedUrl: 'https://one.test/feed',
				icon: '',
				railcar: railcar( 1 ),
				title: 'One',
				url: 'https://one.test',
			},
			{
				algorithm: 'algo',
				blogId: 2,
				description: 'Two',
				feedId: 20,
				feedUrl: 'https://two.test/feed',
				icon: '',
				railcar: railcar( 2 ),
				title: 'Two',
				url: 'https://two.test',
			},
		] );
		appendRecommendedSitesToCache( client, { seed: 7, number: 2 }, [
			{
				algorithm: 'algo',
				blogId: 3,
				description: 'Duplicate feed',
				feedId: 20,
				feedUrl: 'https://dup.test/feed',
				icon: '',
				railcar: railcar( 3 ),
				title: 'Duplicate',
				url: 'https://dup.test',
			},
			{
				algorithm: 'algo',
				blogId: 4,
				description: 'Four',
				feedId: 40,
				feedUrl: 'https://four.test/feed',
				icon: '',
				railcar: railcar( 4 ),
				title: 'Four',
				url: 'https://four.test',
			},
		] );

		const { result } = renderHook( () => useRecommendedSites( { seed: 7, number: 2 } ), {
			wrapper: makeWrapper( client ),
		} );
		const cached = client.getQueryData< InfiniteData< ReadSiteRecommendationsResponse, number > >(
			getReadSiteRecommendationsInfiniteQueryKey( { seed: 7, number: 2 } )
		);

		expect( result.current.data?.map( ( site ) => site.feedId ) ).toEqual( [ 10, 20, 40 ] );
		expect( cached?.pageParams ).toEqual( [ 0, 2 ] );
	} );

	it( 'removes a recommendation by blog id and trims trailing empty pages', () => {
		const client = makeClient();
		appendRecommendedSitesToCache( client, { seed: 7, number: 2 }, [
			{
				algorithm: 'algo',
				blogId: 1,
				description: 'One',
				feedId: 10,
				feedUrl: 'https://one.test/feed',
				icon: '',
				railcar: railcar( 1 ),
				title: 'One',
				url: 'https://one.test',
			},
			{
				algorithm: 'algo',
				blogId: 2,
				description: 'Two',
				feedId: 20,
				feedUrl: 'https://two.test/feed',
				icon: '',
				railcar: railcar( 2 ),
				title: 'Two',
				url: 'https://two.test',
			},
		] );
		appendRecommendedSitesToCache( client, { seed: 7, number: 2 }, [
			{
				algorithm: 'algo',
				blogId: 3,
				description: 'Three',
				feedId: 30,
				feedUrl: 'https://three.test/feed',
				icon: '',
				railcar: railcar( 3 ),
				title: 'Three',
				url: 'https://three.test',
			},
		] );

		removeRecommendedSiteFromCache( client, { seed: 7, siteId: 3 } );

		const { result } = renderHook( () => useRecommendedSites( { seed: 7, number: 2 } ), {
			wrapper: makeWrapper( client ),
		} );
		const cached = client.getQueryData< InfiniteData< ReadSiteRecommendationsResponse, number > >(
			getReadSiteRecommendationsInfiniteQueryKey( { seed: 7, number: 2 } )
		);

		expect( result.current.data?.map( ( site ) => site.blogId ) ).toEqual( [ 1, 2 ] );
		expect( cached?.pages ).toHaveLength( 1 );
		expect( cached?.pageParams ).toEqual( [ 0 ] );
	} );

	it( 'removes same-feed duplicates when removing a visible recommendation', () => {
		const client = makeClient();
		appendRecommendedSitesToCache( client, { seed: 17, number: 2 }, [
			recommendedSite( 1, 10 ),
			recommendedSite( 2, 20 ),
		] );
		appendRecommendedSitesToCache( client, { seed: 17, number: 2 }, [
			recommendedSite( 3, 20 ),
			recommendedSite( 4, 40 ),
		] );

		removeRecommendedSiteFromCache( client, { seed: 17, siteId: 2 } );

		const { result } = renderHook( () => useRecommendedSites( { seed: 17, number: 2 } ), {
			wrapper: makeWrapper( client ),
		} );

		expect( result.current.data?.map( ( site ) => site.blogId ) ).toEqual( [ 1, 4 ] );
	} );

	it( 'removes a recommendation from every cached seed by blog id', () => {
		const client = makeClient();
		appendRecommendedSitesToCache( client, { seed: 17, number: 2 }, [
			recommendedSite( 1, 10 ),
			recommendedSite( 2, 20 ),
		] );
		appendRecommendedSitesToCache( client, { seed: 23, number: 2 }, [
			recommendedSite( 3, 30 ),
			recommendedSite( 2, 20 ),
		] );

		removeRecommendedSiteFromAllCaches( client, 2 );

		const firstSeed = renderHook( () => useRecommendedSites( { seed: 17, number: 2 } ), {
			wrapper: makeWrapper( client ),
		} );
		const secondSeed = renderHook( () => useRecommendedSites( { seed: 23, number: 2 } ), {
			wrapper: makeWrapper( client ),
		} );

		expect( firstSeed.result.current.data?.map( ( site ) => site.blogId ) ).toEqual( [ 1 ] );
		expect( secondSeed.result.current.data?.map( ( site ) => site.blogId ) ).toEqual( [ 3 ] );
	} );

	it( 'keeps a removed recommendation hidden when an in-flight next page resolves', async () => {
		nock( BASE )
			.get( '/rest/v1.2/read/recommendations/sites' )
			.query( { number: '2', offset: '0', seed: '19', posts_per_site: '0' } )
			.reply( 200, {
				algorithm: 'algo',
				sites: [ apiSite( 1, 10 ) ],
			} );
		nock( BASE )
			.get( '/rest/v1.2/read/recommendations/sites' )
			.query( { number: '2', offset: '2', seed: '19', posts_per_site: '0' } )
			.delay( 50 )
			.reply( 200, {
				algorithm: 'algo',
				sites: [ apiSite( 1, 10 ), apiSite( 2, 20 ) ],
			} );

		const client = makeClient();
		const { result } = renderHook( () => useRecommendedSites( { seed: 19, number: 2 } ), {
			wrapper: makeWrapper( client ),
		} );

		await waitFor( () =>
			expect( result.current.data?.map( ( site ) => site.blogId ) ).toEqual( [ 1 ] )
		);

		let nextPagePromise: ReturnType< typeof result.current.fetchNextPage >;
		act( () => {
			nextPagePromise = result.current.fetchNextPage();
		} );
		removeRecommendedSiteFromCache( client, { seed: 19, siteId: 1 } );

		await act( async () => {
			await nextPagePromise;
		} );

		await waitFor( () =>
			expect( result.current.data?.map( ( site ) => site.blogId ) ).toEqual( [ 2 ] )
		);
		expect( nock.isDone() ).toBe( true );
	} );

	it( 'does not share removed recommendations across query clients with the same seed', () => {
		const firstClient = makeClient();
		const secondClient = makeClient();
		appendRecommendedSitesToCache( firstClient, { seed: 29, number: 2 }, [
			recommendedSite( 1, 10 ),
			recommendedSite( 2, 20 ),
		] );
		appendRecommendedSitesToCache( secondClient, { seed: 29, number: 2 }, [
			recommendedSite( 1, 10 ),
			recommendedSite( 2, 20 ),
		] );

		removeRecommendedSiteFromCache( firstClient, { seed: 29, siteId: 1 } );

		const firstResult = renderHook( () => useRecommendedSites( { seed: 29, number: 2 } ), {
			wrapper: makeWrapper( firstClient ),
		} );
		const secondResult = renderHook( () => useRecommendedSites( { seed: 29, number: 2 } ), {
			wrapper: makeWrapper( secondClient ),
		} );

		expect( firstResult.result.current.data?.map( ( site ) => site.blogId ) ).toEqual( [ 2 ] );
		expect( secondResult.result.current.data?.map( ( site ) => site.blogId ) ).toEqual( [ 1, 2 ] );
	} );

	it( 'filters blocked sites before applying the visible display count', () => {
		const visible = selectVisibleRecommendedSites(
			[
				{
					algorithm: 'algo',
					blogId: 1,
					description: 'One',
					feedId: 10,
					feedUrl: 'https://one.test/feed',
					icon: '',
					railcar: railcar( 1 ),
					title: 'One',
					url: 'https://one.test',
				},
				{
					algorithm: 'algo',
					blogId: 2,
					description: 'Two',
					feedId: 20,
					feedUrl: 'https://two.test/feed',
					icon: '',
					railcar: railcar( 2 ),
					title: 'Two',
					url: 'https://two.test',
				},
				{
					algorithm: 'algo',
					blogId: 3,
					description: 'Three',
					feedId: 30,
					feedUrl: 'https://three.test/feed',
					icon: '',
					railcar: railcar( 3 ),
					title: 'Three',
					url: 'https://three.test',
				},
			],
			[ 1 ],
			2
		);

		expect( visible.map( ( site ) => site.blogId ) ).toEqual( [ 2, 3 ] );
	} );

	it( 'fetches the next page when requested', async () => {
		nock( BASE )
			.get( '/rest/v1.2/read/recommendations/sites' )
			.query( { number: '2', offset: '0', seed: '7', posts_per_site: '0' } )
			.reply( 200, {
				algorithm: 'algo',
				sites: [
					{
						blog_id: 1,
						description: 'One',
						feed_id: 10,
						feed_url: 'https://one.test/feed',
						ID: 1,
						name: 'One',
						railcar: {},
						URL: 'https://one.test',
					},
				],
			} );
		nock( BASE )
			.get( '/rest/v1.2/read/recommendations/sites' )
			.query( { number: '2', offset: '2', seed: '7', posts_per_site: '0' } )
			.reply( 200, {
				algorithm: 'algo',
				sites: [
					{
						blog_id: 2,
						description: 'Two',
						feed_id: 20,
						feed_url: 'https://two.test/feed',
						ID: 2,
						name: 'Two',
						railcar: {},
						URL: 'https://two.test',
					},
				],
			} );

		const client = makeClient();
		const { result } = renderHook( () => useRecommendedSites( { seed: 7, number: 2 } ), {
			wrapper: makeWrapper( client ),
		} );

		await waitFor( () => expect( result.current.data ).toHaveLength( 1 ) );

		await act( async () => {
			await result.current.fetchNextPage();
		} );

		await waitFor( () => expect( result.current.data ).toHaveLength( 2 ) );
		expect( result.current.data?.map( ( site ) => site.blogId ) ).toEqual( [ 1, 2 ] );
		expect( nock.isDone() ).toBe( true );
	} );

	it( 'dismisses a recommendation and removes it from the query cache on success', async () => {
		nock( BASE ).post( '/rest/v1.1/me/dismiss/sites/1/new' ).reply( 200, { success: true } );

		const client = makeClient();
		appendRecommendedSitesToCache( client, { seed: 7, number: 2 }, [
			recommendedSite( 1, 10 ),
			recommendedSite( 2, 20 ),
		] );

		const { result } = renderHook( () => useDismissRecommendedSite( { seed: 7 } ), {
			wrapper: makeWrapper( client ),
		} );

		act( () => {
			result.current.mutate( { siteId: 1 } );
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		const cached = client.getQueryData< InfiniteData< ReadSiteRecommendationsResponse, number > >(
			getReadSiteRecommendationsInfiniteQueryKey( { seed: 7, number: 2 } )
		);

		expect(
			cached?.pages.flatMap( ( page ) => page.sites.map( ( site ) => site.blog_id ) )
		).toEqual( [ 2 ] );
		expect( nock.isDone() ).toBe( true );
	} );

	it( 'keeps a recommendation in the query cache when dismissal fails', async () => {
		nock( BASE ).post( '/rest/v1.1/me/dismiss/sites/1/new' ).reply( 500, {
			error: 'dismiss_failed',
		} );

		const client = makeClient();
		appendRecommendedSitesToCache( client, { seed: 7, number: 2 }, [
			recommendedSite( 1, 10 ),
			recommendedSite( 2, 20 ),
		] );

		const { result } = renderHook( () => useDismissRecommendedSite( { seed: 7 } ), {
			wrapper: makeWrapper( client ),
		} );

		act( () => {
			result.current.mutate( { siteId: 1 } );
		} );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );

		const cached = client.getQueryData< InfiniteData< ReadSiteRecommendationsResponse, number > >(
			getReadSiteRecommendationsInfiniteQueryKey( { seed: 7, number: 2 } )
		);

		expect(
			cached?.pages.flatMap( ( page ) => page.sites.map( ( site ) => site.blog_id ) )
		).toEqual( [ 1, 2 ] );
		expect( nock.isDone() ).toBe( true );
	} );
} );
