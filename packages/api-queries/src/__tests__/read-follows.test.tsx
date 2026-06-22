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
	siteSubscriptionsQuery,
	getAliasedSiteSubscriptionFeedUrl,
	getSiteSubscriptionByBlogIdFromData,
	getSiteSubscriptionByFeedIdFromData,
	getSubscribedSitesFromData,
	getSiteSubscriptionsCountFromData,
	getSiteSubscriptionsFromData,
	getSiteSubscriptionsQueryKey,
	getIsSubscribedFromData,
	getOrganizationSiteSubscriptionsFromData,
	markSiteSubscriptionUnfollowed,
	patchSiteSubscription,
	unfollowSiteMutation,
	updateSiteCommentEmailSubscriptionMutation,
	updateSitePostEmailDeliveryFrequencyMutation,
	updateSitePostEmailSubscriptionMutation,
	updateSitePostNotificationSubscriptionMutation,
	type SiteSubscriptionsInfiniteData,
} from '../read-follows';
import type { SiteSubscriptionItem, FollowDeliveryParams } from '@automattic/api-core';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';

const makeWrapper = ( client: QueryClient ) =>
	function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};

const newClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

const makeFollow = ( overrides: Partial< SiteSubscriptionItem > = {} ): SiteSubscriptionItem => ( {
	URL: 'https://example.com/feed/',
	feed_URL: 'https://example.com/feed/',
	blog_ID: 1,
	feed_ID: 10,
	is_following: true,
	...overrides,
} );

const makeData = (
	subscriptions: SiteSubscriptionItem[],
	totalCount: number | null = subscriptions.length
) => ( {
	pages: [
		{
			subscriptions,
			totalCount,
			page: 1,
			number: 200,
		},
	],
	pageParams: [ 1 ],
} );

const getCachedData = ( client: QueryClient ) =>
	client.getQueryData< SiteSubscriptionsInfiniteData >( getSiteSubscriptionsQueryKey() );

describe( 'siteSubscriptionsQuery', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches follows with the canonical key and legacy paging args', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.2/read/following/mine' )
			.query( { page: '1', number: '100', meta: '' } )
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
				number: 1,
			} );

		const client = newClient();
		const options = siteSubscriptionsQuery();
		const { result } = renderHook( () => useInfiniteQuery( options ), {
			wrapper: makeWrapper( client ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( options.queryKey ).toEqual( [ 'read', 'site-subscriptions' ] );
		expect( scope.isDone() ).toBe( true );
		expect( result.current.data?.pages[ 0 ].subscriptions[ 0 ] ).toMatchObject( {
			ID: 123,
			URL: 'https://example.com/feed/',
			feed_URL: 'https://example.com/feed/',
			blog_ID: 456,
			feed_ID: 789,
			is_following: true,
		} );
	} );

	it( 'paginates by the server total, past short and empty pages, until all rows are covered', async () => {
		// The server walks raw rows by offset and filters deleted/spammy sites
		// *after* applying the page limit, so a page can be short or even empty
		// while later offset windows still hold valid rows. With a reported total
		// of 250 and a page size of 100, three pages cover every row — even
		// though the middle page comes back empty.
		const makeSubscription = ( id: number ) => ( {
			ID: String( id ),
			URL: `https://example-${ id }.com/feed/`,
			blog_ID: String( id ),
			feed_ID: String( id ),
		} );

		nock( BASE )
			.get( '/rest/v1.2/read/following/mine' )
			.query( { page: '1', number: '100', meta: '' } )
			.reply( 200, {
				subscriptions: [ makeSubscription( 1 ), makeSubscription( 2 ) ],
				total_subscriptions: 250,
				page: 1,
				number: 2,
			} );
		// Middle page: every raw row in this window was filtered out, so it comes
		// back empty — but there are still rows beyond it.
		nock( BASE )
			.get( '/rest/v1.2/read/following/mine' )
			.query( { page: '2', number: '100', meta: '' } )
			.reply( 200, {
				subscriptions: [],
				total_subscriptions: 250,
				page: 2,
				number: 0,
			} );
		nock( BASE )
			.get( '/rest/v1.2/read/following/mine' )
			.query( { page: '3', number: '100', meta: '' } )
			.reply( 200, {
				subscriptions: [ makeSubscription( 3 ) ],
				total_subscriptions: 250,
				page: 3,
				number: 1,
			} );

		const client = newClient();
		const { result } = renderHook( () => useInfiniteQuery( siteSubscriptionsQuery() ), {
			wrapper: makeWrapper( client ),
		} );

		// Page 1 (auto-fetched) only covers 100 of 250 rows, so more remain.
		await waitFor( () => expect( result.current.data?.pages ).toHaveLength( 1 ) );
		expect( result.current.hasNextPage ).toBe( true );

		// Page 2 comes back empty, but 200 < 250 rows covered — keep going.
		await act( async () => {
			await result.current.fetchNextPage();
		} );
		await waitFor( () => expect( result.current.data?.pages ).toHaveLength( 2 ) );
		expect( result.current.hasNextPage ).toBe( true );

		// Page 3 covers rows up to 300 >= 250, so pagination stops here.
		await act( async () => {
			await result.current.fetchNextPage();
		} );
		await waitFor( () => expect( result.current.hasNextPage ).toBe( false ) );

		// The site beyond the empty middle page is still collected.
		expect( getSiteSubscriptionsFromData( result.current.data ).map( ( sub ) => sub.ID ) ).toEqual(
			[ 1, 2, 3 ]
		);
	} );
} );

describe( 'follow selectors and cache helpers', () => {
	it( 'preserves requested URL aliases when the returned follow has a different feed URL', () => {
		const client = newClient();
		const follow = makeFollow( {
			URL: 'https://example.com/feed/',
			feed_URL: 'https://example.com/feed/',
		} );

		patchSiteSubscription( client, {
			requestedFeedUrl: 'https://example.com/rss',
			subscription: follow,
		} );

		const data = getCachedData( client );

		expect( data?.pages[ 0 ].subscriptions[ 0 ].alias_feed_URLs ).toEqual( [
			'https://example.com/rss',
		] );
		expect( getAliasedSiteSubscriptionFeedUrl( data, 'https://example.com/rss' ) ).toBe(
			'https://example.com/feed/'
		);
		expect( getIsSubscribedFromData( data, { feedUrl: 'https://example.com/rss' } ) ).toBe( true );
		expect( data?.pages[ 0 ].totalCount ).toBe( 1 );
	} );

	it( 'clears stale errors when patching a successful follow', () => {
		const client = newClient();
		client.setQueryData(
			getSiteSubscriptionsQueryKey(),
			makeData( [
				makeFollow( {
					error: { message: 'Unable to follow' },
				} ),
			] )
		);

		patchSiteSubscription( client, {
			requestedFeedUrl: 'https://example.com/feed/',
			subscription: makeFollow( {
				name: 'Example',
			} ),
		} );

		const cachedFollow = getCachedData( client )?.pages[ 0 ].subscriptions[ 0 ];
		expect( cachedFollow?.error ).toBeUndefined();
		expect( getSiteSubscriptionsFromData( getCachedData( client ) ) ).toEqual( [
			expect.objectContaining( { name: 'Example' } ),
		] );
	} );

	it( 'preserves existing notification delivery state when patching a successful follow', () => {
		const client = newClient();
		client.setQueryData(
			getSiteSubscriptionsQueryKey(),
			makeData( [
				makeFollow( {
					delivery_methods: {
						email: { send_posts: false },
						notification: { send_posts: false },
					},
				} ),
			] )
		);

		patchSiteSubscription( client, {
			requestedFeedUrl: 'https://example.com/feed/',
			subscription: makeFollow( {
				delivery_methods: {
					email: { send_posts: true },
					notification: { send_posts: true },
				},
			} ),
		} );

		const cachedFollow = getCachedData( client )?.pages[ 0 ].subscriptions[ 0 ];
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

		expect( getSiteSubscriptionsFromData( data ) ).toEqual( [ alpha, beta ] );
		expect( getSiteSubscriptionsCountFromData( data ) ).toBe( 2 );
		expect( getSiteSubscriptionByBlogIdFromData( data, 22 ) ).toBe( beta );
		expect( getSiteSubscriptionByFeedIdFromData( data, 101 ) ).toBe( alpha );
		expect( getSubscribedSitesFromData( data, null ) ).toEqual( [ alpha ] );
		expect( getOrganizationSiteSubscriptionsFromData( data, 7 ) ).toEqual( [ beta ] );
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

		expect( getSubscribedSitesFromData( data, 0 ) ).toEqual( [
			zeroOrganization,
			nullOrganization,
			missingOrganization,
		] );
		expect( getSubscribedSitesFromData( data, null ) ).toEqual( [
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
		client.setQueryData( getSiteSubscriptionsQueryKey(), makeData( [ follow ] ) );

		markSiteSubscriptionUnfollowed( client, 'https://example.com/rss' );

		const cachedFollow = getCachedData( client )?.pages[ 0 ].subscriptions[ 0 ];
		expect( cachedFollow?.is_following ).toBe( false );
		expect( cachedFollow?.delivery_methods?.email?.send_posts ).toBe( true );
		expect( cachedFollow?.delivery_methods?.notification?.send_posts ).toBe( false );
		expect(
			getIsSubscribedFromData( getCachedData( client ), { feedUrl: 'https://example.com/feed/' } )
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
			getIsSubscribedFromData( getCachedData( client ), { feedUrl: 'https://example.com/rss' } )
		).toBe( true );
		expect( client.getQueryState( getSiteSubscriptionsQueryKey() )?.isInvalidated ).toBe( true );
	} );

	it( 'supports subscription identifiers when unfollowing and invalidates follows when no URL can be patched', async () => {
		const scope = nock( BASE )
			.post( '/rest/v1.1/read/following/mine/delete', { sub_id: 1234 } )
			.reply( 200, { subscribed: false } );
		const client = newClient();
		const invalidateQueries = jest.spyOn( client, 'invalidateQueries' );
		client.setQueryData( getSiteSubscriptionsQueryKey(), makeData( [ makeFollow() ] ) );

		const { result } = renderHook( () => useMutation( unfollowSiteMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await result.current.mutateAsync( { subscriptionId: 1234 } );
		} );

		expect( scope.isDone() ).toBe( true );
		expect( client.getQueryState( getSiteSubscriptionsQueryKey() )?.isInvalidated ).toBe( true );
		expect( invalidateQueries ).toHaveBeenCalledTimes( 1 );
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
			getSiteSubscriptionsQueryKey(),
			makeData( [
				makeFollow( {
					feed_URL: 'https://example.com/feed/',
					delivery_methods: {
						notification: { send_posts: true },
					},
				} ),
			] )
		);
		const invalidateQueries = jest.spyOn( client, 'invalidateQueries' );

		const { result } = renderHook( () => useMutation( unfollowSiteMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await result.current.mutateAsync( {
				feedUrl: 'https://example.com/feed/',
				source: 'calypso',
			} );
		} );

		const cachedFollow = getCachedData( client )?.pages[ 0 ].subscriptions[ 0 ];
		expect( scope.isDone() ).toBe( true );
		expect( cachedFollow?.is_following ).toBe( false );
		expect( cachedFollow?.delivery_methods?.notification?.send_posts ).toBe( false );
		expect( client.getQueryState( getSiteSubscriptionsQueryKey() )?.isInvalidated ).toBe( true );
		expect( invalidateQueries ).toHaveBeenCalledTimes( 1 );
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
		client.setQueryData( getSiteSubscriptionsQueryKey(), makeData( [ makeFollow() ] ) );

		const { result } = renderHook( () => useMutation( factory( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await result.current.mutateAsync( params as FollowDeliveryParams );
		} );

		expect( request.isDone() ).toBe( true );
		expect( client.getQueryState( getSiteSubscriptionsQueryKey() )?.isInvalidated ).toBe( true );
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
			getSiteSubscriptionsQueryKey(),
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
				getCachedData( client )?.pages[ 0 ].subscriptions[ 0 ].delivery_methods?.email
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
			getSiteSubscriptionsQueryKey(),
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
			getCachedData( client )?.pages[ 0 ].subscriptions[ 0 ].delivery_methods?.notification
		).toEqual( {
			send_posts: true,
		} );
	} );
} );
