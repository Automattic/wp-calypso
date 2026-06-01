import {
	QueryClient,
	QueryClientProvider,
	useInfiniteQuery,
	useMutation,
} from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	followSiteMutation,
	followsQuery,
	getAliasedFollowFeedUrl,
	getFollowByBlogIdFromData,
	getFollowByFeedIdFromData,
	getFollowedSitesFromData,
	getFollowsCountFromData,
	getFollowsFromData,
	getFollowsQueryKey,
	getIsFollowingFromData,
	getOrganizationFollowsFromData,
	markFollowUnfollowed,
	patchFollow,
	unfollowSiteMutation,
	updateSiteCommentEmailSubscriptionMutation,
	updateSitePostEmailDeliveryFrequencyMutation,
	updateSitePostEmailSubscriptionMutation,
	updateSitePostNotificationSubscriptionMutation,
	type FollowsInfiniteData,
} from '../read-follows';
import type { FollowItem, FollowDeliveryParams } from '@automattic/api-core';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';

const makeWrapper = ( client: QueryClient ) =>
	function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};

const newClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

const makeFollow = ( overrides: Partial< FollowItem > = {} ): FollowItem => ( {
	URL: 'https://example.com/feed/',
	feed_URL: 'https://example.com/feed/',
	blog_ID: 1,
	feed_ID: 10,
	is_following: true,
	...overrides,
} );

const makeData = ( follows: FollowItem[], totalCount: number | null = follows.length ) => ( {
	pages: [
		{
			follows,
			totalCount,
			page: 1,
			number: 200,
		},
	],
	pageParams: [ 1 ],
} );

const getCachedData = ( client: QueryClient ) =>
	client.getQueryData< FollowsInfiniteData >( getFollowsQueryKey() );

describe( 'followsQuery', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches follows with the canonical key and legacy paging args', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.2/read/following/mine' )
			.query( { page: '1', number: '200', meta: '' } )
			.reply( 200, {
				subscriptions: [
					{
						ID: '123',
						URL: 'https://example.com/feed/',
						blog_ID: '456',
						feed_ID: '789',
					},
				],
				total_subscriptions: 1,
				page: 1,
				number: 200,
			} );

		const client = newClient();
		const options = followsQuery();
		const { result } = renderHook( () => useInfiniteQuery( options ), {
			wrapper: makeWrapper( client ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( options.queryKey ).toEqual( [ 'read', 'follows' ] );
		expect( scope.isDone() ).toBe( true );
		expect( result.current.data?.pages[ 0 ].follows[ 0 ] ).toMatchObject( {
			ID: 123,
			URL: 'https://example.com/feed/',
			feed_URL: 'https://example.com/feed/',
			blog_ID: 456,
			feed_ID: 789,
			is_following: true,
		} );
	} );
} );

describe( 'follow selectors and cache helpers', () => {
	it( 'preserves requested URL aliases when the returned follow has a different feed URL', () => {
		const client = newClient();
		const follow = makeFollow( {
			URL: 'https://example.com/feed/',
			feed_URL: 'https://example.com/feed/',
		} );

		patchFollow( client, {
			requestedFeedUrl: 'https://example.com/rss',
			follow,
		} );

		const data = getCachedData( client );

		expect( data?.pages[ 0 ].follows[ 0 ].alias_feed_URLs ).toEqual( [
			'https://example.com/rss',
		] );
		expect( getAliasedFollowFeedUrl( data, 'https://example.com/rss' ) ).toBe(
			'https://example.com/feed/'
		);
		expect( getIsFollowingFromData( data, { feedUrl: 'https://example.com/rss' } ) ).toBe( true );
		expect( data?.pages[ 0 ].totalCount ).toBe( 1 );
	} );

	it( 'clears stale errors when patching a successful follow', () => {
		const client = newClient();
		client.setQueryData(
			getFollowsQueryKey(),
			makeData( [
				makeFollow( {
					error: { message: 'Unable to follow' },
				} ),
			] )
		);

		patchFollow( client, {
			requestedFeedUrl: 'https://example.com/feed/',
			follow: makeFollow( {
				name: 'Example',
			} ),
		} );

		const cachedFollow = getCachedData( client )?.pages[ 0 ].follows[ 0 ];
		expect( cachedFollow?.error ).toBeUndefined();
		expect( getFollowsFromData( getCachedData( client ) ) ).toEqual( [
			expect.objectContaining( { name: 'Example' } ),
		] );
	} );

	it( 'preserves existing notification delivery state when patching a successful follow', () => {
		const client = newClient();
		client.setQueryData(
			getFollowsQueryKey(),
			makeData( [
				makeFollow( {
					delivery_methods: {
						email: { send_posts: false },
						notification: { send_posts: false },
					},
				} ),
			] )
		);

		patchFollow( client, {
			requestedFeedUrl: 'https://example.com/feed/',
			follow: makeFollow( {
				delivery_methods: {
					email: { send_posts: true },
					notification: { send_posts: true },
				},
			} ),
		} );

		const cachedFollow = getCachedData( client )?.pages[ 0 ].follows[ 0 ];
		expect( cachedFollow?.delivery_methods?.email?.send_posts ).toBe( true );
		expect( cachedFollow?.delivery_methods?.notification?.send_posts ).toBe( false );
	} );

	it( 'derives count and blog/feed lookups from cached data', () => {
		const alpha = makeFollow( {
			URL: 'https://alpha.example/feed/',
			feed_URL: 'https://alpha.example/feed/',
			blog_ID: 11,
			feed_ID: 101,
			name: 'Alpha',
			last_updated: 10,
		} );
		const beta = makeFollow( {
			URL: 'https://beta.example/feed/',
			feed_URL: 'https://beta.example/feed/',
			blog_ID: 22,
			feed_ID: 202,
			name: 'Beta',
			last_updated: 20,
			organization_id: 7,
		} );
		const errored = makeFollow( {
			URL: 'https://broken.example/feed/',
			feed_URL: 'https://broken.example/feed/',
			blog_ID: 33,
			feed_ID: 303,
			error: { message: 'Nope' },
		} );
		const data = makeData( [ alpha, beta, errored ], 1 );

		expect( getFollowsFromData( data ) ).toEqual( [ alpha, beta ] );
		expect( getFollowsCountFromData( data ) ).toBe( 2 );
		expect( getFollowByBlogIdFromData( data, 22 ) ).toBe( beta );
		expect( getFollowByFeedIdFromData( data, 101 ) ).toBe( alpha );
		expect( getFollowedSitesFromData( data, null ) ).toEqual( [ alpha ] );
		expect( getOrganizationFollowsFromData( data, 7 ) ).toEqual( [ beta ] );
	} );

	it( 'includes zero, null, and missing organization ids in personal follows', () => {
		const zeroOrganization = makeFollow( {
			URL: 'https://zero.example/feed/',
			feed_URL: 'https://zero.example/feed/',
			feed_ID: 100,
			organization_id: 0,
		} );
		const nullOrganization = makeFollow( {
			URL: 'https://null.example/feed/',
			feed_URL: 'https://null.example/feed/',
			feed_ID: 101,
			organization_id: null,
		} );
		const missingOrganization = makeFollow( {
			URL: 'https://missing.example/feed/',
			feed_URL: 'https://missing.example/feed/',
			feed_ID: 102,
		} );
		const organizationFollow = makeFollow( {
			URL: 'https://organization.example/feed/',
			feed_URL: 'https://organization.example/feed/',
			feed_ID: 103,
			organization_id: 7,
		} );
		const data = makeData( [
			zeroOrganization,
			nullOrganization,
			missingOrganization,
			organizationFollow,
		] );

		expect( getFollowedSitesFromData( data, 0 ) ).toEqual( [
			zeroOrganization,
			nullOrganization,
			missingOrganization,
		] );
		expect( getFollowedSitesFromData( data, null ) ).toEqual( [
			zeroOrganization,
			nullOrganization,
			missingOrganization,
		] );
	} );

	it( 'marks a URL or alias unfollowed and disables post notifications', () => {
		const client = newClient();
		const follow = makeFollow( {
			URL: 'https://example.com/feed/',
			feed_URL: 'https://example.com/feed/',
			alias_feed_URLs: [ 'https://example.com/rss' ],
			delivery_methods: {
				email: { send_posts: true },
				notification: { send_posts: true },
			},
		} );
		client.setQueryData( getFollowsQueryKey(), makeData( [ follow ] ) );

		markFollowUnfollowed( client, 'https://example.com/rss' );

		const cachedFollow = getCachedData( client )?.pages[ 0 ].follows[ 0 ];
		expect( cachedFollow?.is_following ).toBe( false );
		expect( cachedFollow?.delivery_methods?.email?.send_posts ).toBe( true );
		expect( cachedFollow?.delivery_methods?.notification?.send_posts ).toBe( false );
		expect(
			getIsFollowingFromData( getCachedData( client ), { feedUrl: 'https://example.com/feed/' } )
		).toBe( false );
	} );
} );

describe( 'follow mutations', () => {
	afterEach( () => nock.cleanAll() );

	it( 'patches cached follows and invalidates site subscriptions after following a URL', async () => {
		const scope = nock( BASE )
			.post( '/rest/v1.1/read/following/mine/new', {
				url: 'https://example.com/rss',
				source: 'calypso',
			} )
			.reply( 200, {
				subscribed: true,
				subscription: {
					ID: '123',
					URL: 'https://example.com/feed/',
					blog_ID: '456',
					feed_ID: '789',
				},
			} );
		const client = newClient();
		client.setQueryData( [ 'read', 'site-subscriptions' ], [] );

		const { result } = renderHook( () => useMutation( followSiteMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await result.current.mutateAsync( {
				feedUrl: 'https://example.com/rss',
				source: 'calypso',
			} );
		} );

		expect( scope.isDone() ).toBe( true );
		expect(
			getIsFollowingFromData( getCachedData( client ), { feedUrl: 'https://example.com/rss' } )
		).toBe( true );
		expect( client.getQueryState( [ 'read', 'site-subscriptions' ] )?.isInvalidated ).toBe( true );
	} );

	it( 'supports subscription identifiers when unfollowing and invalidates follows when no URL can be patched', async () => {
		const scope = nock( BASE )
			.post( '/rest/v1.1/read/following/mine/delete', { sub_id: 1234 } )
			.reply( 200, { subscribed: false } );
		const client = newClient();
		client.setQueryData( getFollowsQueryKey(), makeData( [ makeFollow() ] ) );
		client.setQueryData( [ 'read', 'site-subscriptions' ], [] );

		const { result } = renderHook( () => useMutation( unfollowSiteMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await result.current.mutateAsync( { subscriptionId: 1234 } );
		} );

		expect( scope.isDone() ).toBe( true );
		expect( client.getQueryState( getFollowsQueryKey() )?.isInvalidated ).toBe( true );
		expect( client.getQueryState( [ 'read', 'site-subscriptions' ] )?.isInvalidated ).toBe( true );
	} );

	it( 'patches cached follows and invalidates site subscriptions after unfollowing a URL', async () => {
		const scope = nock( BASE )
			.post( '/rest/v1.1/read/following/mine/delete', {
				url: 'https://example.com/feed/',
				source: 'calypso',
			} )
			.reply( 200, { subscribed: false } );
		const client = newClient();
		client.setQueryData(
			getFollowsQueryKey(),
			makeData( [
				makeFollow( {
					feed_URL: 'https://example.com/feed/',
					delivery_methods: {
						notification: { send_posts: true },
					},
				} ),
			] )
		);
		client.setQueryData( [ 'read', 'site-subscriptions' ], [] );

		const { result } = renderHook( () => useMutation( unfollowSiteMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await result.current.mutateAsync( {
				feedUrl: 'https://example.com/feed/',
				source: 'calypso',
			} );
		} );

		const cachedFollow = getCachedData( client )?.pages[ 0 ].follows[ 0 ];
		expect( scope.isDone() ).toBe( true );
		expect( cachedFollow?.is_following ).toBe( false );
		expect( cachedFollow?.delivery_methods?.notification?.send_posts ).toBe( false );
		expect( client.getQueryState( [ 'read', 'site-subscriptions' ] )?.isInvalidated ).toBe( true );
	} );
} );

describe( 'delivery mutations', () => {
	afterEach( () => nock.cleanAll() );

	it.each( [
		{
			name: 'post email subscription',
			factory: updateSitePostEmailSubscriptionMutation,
			params: { blogId: 123, sendPosts: true, deliveryFrequency: 'daily' },
			scope: () =>
				nock( BASE )
					.post( '/rest/v1.2/read/site/123/post_email_subscriptions/new', {
						delivery_frequency: 'daily',
					} )
					.reply( 200, { subscribed: true } ),
		},
		{
			name: 'comment email subscription',
			factory: updateSiteCommentEmailSubscriptionMutation,
			params: { blogId: 123, sendComments: true },
			scope: () =>
				nock( BASE )
					.post( '/rest/v1.2/read/site/123/comment_email_subscriptions/new', {} )
					.reply( 200, { subscribed: true } ),
		},
		{
			name: 'post email delivery frequency',
			factory: updateSitePostEmailDeliveryFrequencyMutation,
			params: { blogId: 123, deliveryFrequency: 'weekly' },
			scope: () =>
				nock( BASE )
					.post( '/rest/v1.2/read/site/123/post_email_subscriptions/update', {
						delivery_frequency: 'weekly',
					} )
					.reply( 200, { success: true } ),
		},
		{
			name: 'post notification subscription',
			factory: updateSitePostNotificationSubscriptionMutation,
			params: { blogId: 123, sendPosts: true },
			scope: () =>
				nock( BASE )
					.post( '/wpcom/v2/read/sites/123/notification-subscriptions/new', {} )
					.reply( 200, { subscribed: true } ),
		},
	] )( 'invalidates follows on settle for $name', async ( { factory, params, scope } ) => {
		const request = scope();
		const client = newClient();
		client.setQueryData( getFollowsQueryKey(), makeData( [ makeFollow() ] ) );

		const { result } = renderHook( () => useMutation( factory( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await result.current.mutateAsync( params as FollowDeliveryParams );
		} );

		expect( request.isDone() ).toBe( true );
		expect( client.getQueryState( getFollowsQueryKey() )?.isInvalidated ).toBe( true );
	} );

	it( 'lets api-core reject omitted delivery booleans and frequency', async () => {
		const invalidCases = [
			{
				options: updateSitePostEmailSubscriptionMutation( newClient() ),
				params: { blogId: 123 },
				message: 'sendPosts must be a boolean',
			},
			{
				options: updateSiteCommentEmailSubscriptionMutation( newClient() ),
				params: { blogId: 123 },
				message: 'sendComments must be a boolean',
			},
			{
				options: updateSitePostNotificationSubscriptionMutation( newClient() ),
				params: { blogId: 123 },
				message: 'sendPosts must be a boolean',
			},
			{
				options: updateSitePostEmailDeliveryFrequencyMutation( newClient() ),
				params: { blogId: 123 },
				message: 'deliveryFrequency must be one of instantly, daily, or weekly',
			},
		];

		for ( const { options, params, message } of invalidCases ) {
			await expect( options.mutationFn?.( params as FollowDeliveryParams ) ).rejects.toThrow(
				message
			);
		}
	} );

	it( 'optimistically patches delivery methods in the follows cache', async () => {
		const request = nock( BASE )
			.post( '/rest/v1.2/read/site/123/post_email_subscriptions/new', {
				delivery_frequency: 'daily',
			} )
			.delay( 50 )
			.reply( 200, { subscribed: true } );
		const client = newClient();
		client.setQueryData(
			getFollowsQueryKey(),
			makeData( [
				makeFollow( {
					blog_ID: 123,
					delivery_methods: {
						email: { send_posts: false, post_delivery_frequency: 'weekly' },
					},
				} ),
			] )
		);

		const { result } = renderHook(
			() => useMutation( updateSitePostEmailSubscriptionMutation( client ) ),
			{
				wrapper: makeWrapper( client ),
			}
		);

		act( () => {
			result.current.mutate( { blogId: 123, sendPosts: true, deliveryFrequency: 'daily' } );
		} );

		await waitFor( () =>
			expect(
				getCachedData( client )?.pages[ 0 ].follows[ 0 ].delivery_methods?.email
			).toMatchObject( {
				send_posts: true,
				post_delivery_frequency: 'daily',
			} )
		);
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( request.isDone() ).toBe( true );
	} );

	it( 'rolls back optimistic delivery changes when the mutation fails', async () => {
		nock( BASE )
			.post( '/wpcom/v2/read/sites/123/notification-subscriptions/delete', {} )
			.reply( 500, { error: 'subscription_failed' } );
		const client = newClient();
		client.setQueryData(
			getFollowsQueryKey(),
			makeData( [
				makeFollow( {
					blog_ID: 123,
					delivery_methods: {
						notification: { send_posts: true },
					},
				} ),
			] )
		);

		const { result } = renderHook(
			() => useMutation( updateSitePostNotificationSubscriptionMutation( client ) ),
			{
				wrapper: makeWrapper( client ),
			}
		);

		act( () => {
			result.current.mutate( { blogId: 123, sendPosts: false } );
		} );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );

		expect(
			getCachedData( client )?.pages[ 0 ].follows[ 0 ].delivery_methods?.notification
		).toEqual( {
			send_posts: true,
		} );
	} );
} );
