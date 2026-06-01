import { getReadSiteRecommendationsInfiniteQueryKey } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { NOTICE_CREATE } from 'calypso/state/action-types';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
import { READER_FOLLOW_COMPLETE } from 'calypso/state/reader/action-types';
import { follow, unfollow } from 'calypso/state/reader/follows/actions';
import { requestFollow, receiveFollow, followError } from '../';

jest.mock( 'calypso/state/query-client', () => ( {
	getCalypsoQueryClient: jest.fn(),
} ) );

const recommendedSite = ( blogId ) => ( {
	algorithm: 'algo',
	blogId,
	description: 'Description',
	feedId: blogId + 100,
	feedUrl: `https://example.com/${ blogId }/feed`,
	icon: '',
	railcar: {
		railcar: `railcar-${ blogId }`,
		fetch_algo: 'algo',
		fetch_lang: 'en',
		fetch_position: blogId,
		rec_blog_id: String( blogId ),
	},
	title: `Site ${ blogId }`,
	url: `https://example.com/${ blogId }`,
} );

const appendRecommendedSitesToCache = ( queryClient, { seed, number }, sites ) => {
	const queryKey = getReadSiteRecommendationsInfiniteQueryKey( { seed, number } );
	queryClient.setQueryData( queryKey, ( current ) => {
		const page = {
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
	} );
};

const getCachedRecommendedSiteIds = ( queryClient, { seed, number } ) => {
	const data = queryClient.getQueryData(
		getReadSiteRecommendationsInfiniteQueryKey( { seed, number } )
	);
	return data?.pages.flatMap( ( page ) => page.sites.map( ( site ) => site.blog_id ) ) ?? [];
};

beforeEach( () => {
	getCalypsoQueryClient.mockReturnValue( null );
} );

describe( 'requestFollow', () => {
	test( 'should dispatch a http request', () => {
		const action = follow( 'http://example.com' );
		const result = requestFollow( action );

		expect( result ).toEqual(
			http(
				{
					method: 'POST',
					path: '/read/following/mine/new',
					apiVersion: '1.1',
					body: {
						url: 'http://example.com',
						source: 'calypso',
					},
				},
				action
			)
		);
	} );
} );

describe( 'receiveFollow', () => {
	test( 'should dispatch updateFollow with new subscription info', () => {
		const action = follow( 'http://example.com', null, { siteId: 123 } );
		const response = {
			subscribed: true,
			subscription: {
				ID: 1,
				URL: 'http://example.com',
				blog_ID: 2,
				feed_ID: 3,
				date_subscribed: '1976-09-15T12:00:00Z',
				delivery_methods: {},
				is_owner: false,
				last_updated: null,
			},
		};
		const result = receiveFollow( action, response );
		expect( result[ 0 ] ).toMatchObject(
			bypassDataLayer(
				follow( 'http://example.com', {
					ID: 1,
					URL: 'http://example.com',
					feed_URL: 'http://example.com',
					blog_ID: 2,
					feed_ID: 3,
					date_subscribed: 211636800000,
					delivery_methods: {},
					is_owner: false,
					last_updated: NaN,
				} )
			)
		);
		expect( result[ 1 ] ).toMatchObject( {
			type: READER_FOLLOW_COMPLETE,
			payload: {
				feedUrl: 'http://example.com',
			},
		} );
	} );

	test( 'should remove a followed recommended site from the query cache', () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		getCalypsoQueryClient.mockReturnValue( queryClient );
		appendRecommendedSitesToCache( queryClient, { seed: 456, number: 4 }, [
			recommendedSite( 123 ),
		] );
		const action = follow( 'http://example.com', null, {
			siteId: 123,
			seed: 456,
			siteTitle: 'Example Site',
		} );
		const response = {
			subscribed: true,
			subscription: {
				ID: 1,
				URL: 'http://example.com',
				blog_ID: 2,
				feed_ID: 3,
				date_subscribed: '1976-09-15T12:00:00Z',
				delivery_methods: {},
				is_owner: false,
				last_updated: null,
			},
		};

		const result = receiveFollow( action, response );

		expect( getCalypsoQueryClient ).toHaveBeenCalled();
		expect( getCachedRecommendedSiteIds( queryClient, { seed: 456, number: 4 } ) ).toEqual( [] );
		expect( result ).toEqual(
			expect.arrayContaining( [
				expect.objectContaining( {
					notice: expect.objectContaining( {
						status: 'is-success',
					} ),
				} ),
			] )
		);
	} );

	test( 'should dispatch an error notice when subscribed is false', () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		getCalypsoQueryClient.mockReturnValue( queryClient );
		appendRecommendedSitesToCache( queryClient, { seed: 456, number: 4 }, [
			recommendedSite( 123 ),
		] );
		const action = follow( 'http://example.com', null, {
			siteId: 123,
			seed: 456,
			siteTitle: 'Example Site',
		} );
		const response = {
			subscribed: false,
		};

		const result = receiveFollow( action, response );
		expect( result[ 0 ] ).toMatchObject( {
			type: NOTICE_CREATE,
			notice: {
				status: 'is-error',
			},
		} );
		expect( result[ 1 ] ).toMatchObject( {
			type: READER_FOLLOW_COMPLETE,
			payload: {
				feedUrl: 'http://example.com',
			},
		} );
		expect( result[ 2 ] ).toEqual( bypassDataLayer( unfollow( 'http://example.com' ) ) );
		expect( getCachedRecommendedSiteIds( queryClient, { seed: 456, number: 4 } ) ).toEqual( [
			123,
		] );
	} );
} );

describe( 'followError', () => {
	test( 'should dispatch an error notice', () => {
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		getCalypsoQueryClient.mockReturnValue( queryClient );
		appendRecommendedSitesToCache( queryClient, { seed: 456, number: 4 }, [
			recommendedSite( 123 ),
		] );
		const action = follow( 'http://example.com', null, {
			siteId: 123,
			seed: 456,
			siteTitle: 'Example Site',
		} );

		const result = followError( action );
		expect( result[ 0 ] ).toMatchObject( { type: NOTICE_CREATE } );
		expect( result[ 1 ] ).toMatchObject( {
			type: READER_FOLLOW_COMPLETE,
			payload: {
				feedUrl: 'http://example.com',
			},
		} );
		expect( result[ 2 ] ).toEqual( bypassDataLayer( unfollow( 'http://example.com' ) ) );
		expect( getCachedRecommendedSiteIds( queryClient, { seed: 456, number: 4 } ) ).toEqual( [
			123,
		] );
	} );
} );
