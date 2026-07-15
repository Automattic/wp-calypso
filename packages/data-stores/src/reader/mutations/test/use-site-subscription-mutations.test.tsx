/**
 * @jest-environment jsdom
 */
import {
	getSiteSubscriptionsQueryKey,
	readFeedQueryKey,
	type SiteSubscriptionsInfiniteData,
} from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { callApi } from '../../helpers';
import useSiteSubscribeMutation from '../../mutations/use-site-subscribe-mutation';
import useSiteUnsubscribeMutation from '../../mutations/use-site-unsubscribe-mutation';
import type { SiteSubscriptionItem } from '../../types';
import type { ReactNode } from 'react';

jest.mock( '../../hooks', () => ( {
	useIsLoggedIn: jest.fn().mockReturnValue( { isLoggedIn: true, id: 1 } ),
	useCacheKey: jest.fn( ( key ) => [ ...key, true, 1 ] ),
} ) );

jest.mock( '../../helpers', () => ( {
	...jest.requireActual( '../../helpers' ),
	callApi: jest.fn(),
} ) );

const makeQueryClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

const makeWrapper = ( queryClient: QueryClient ) =>
	function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
	};

const makeSubscription = (
	overrides: Partial< SiteSubscriptionItem > = {}
): SiteSubscriptionItem => ( {
	ID: 123,
	URL: 'https://example.com',
	feed_URL: 'https://example.com/feed',
	blog_ID: 123,
	feed_ID: 456,
	is_following: true,
	isDeleted: false,
	...overrides,
} );

const makeSiteSubscriptionsData = (
	subscriptions: SiteSubscriptionItem[],
	totalCount = subscriptions.length
): SiteSubscriptionsInfiniteData => ( {
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

const getCachedSubscriptions = ( queryClient: QueryClient ) =>
	queryClient.getQueryData< SiteSubscriptionsInfiniteData >( getSiteSubscriptionsQueryKey() )
		?.pages[ 0 ];

describe( 'site subscription mutations', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'optimistically restores a deleted site subscription and increments total count', async () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData(
			getSiteSubscriptionsQueryKey(),
			makeSiteSubscriptionsData(
				[ makeSubscription( { is_following: false, isDeleted: true } ) ],
				0
			)
		);
		( callApi as jest.Mock ).mockResolvedValue( { subscribed: true } );

		const { result } = renderHook( () => useSiteSubscribeMutation(), {
			wrapper: makeWrapper( queryClient ),
		} );

		act( () => {
			result.current.mutate( {
				blog_id: 123,
				url: 'https://example.com/feed',
				doNotInvalidateSiteSubscriptions: true,
			} );
		} );

		await waitFor( () => expect( callApi ).toHaveBeenCalled() );
		const page = getCachedSubscriptions( queryClient );
		expect( page?.totalCount ).toBe( 1 );
		expect( page?.subscriptions[ 0 ] ).toMatchObject( {
			is_following: true,
			isDeleted: false,
		} );
	} );

	it( 'invalidates the feed query so the subscribe button reflects the new subscription', async () => {
		const queryClient = makeQueryClient();
		const invalidateQueries = jest.spyOn( queryClient, 'invalidateQueries' );
		( callApi as jest.Mock ).mockResolvedValue( { subscribed: true } );

		const { result } = renderHook( () => useSiteSubscribeMutation(), {
			wrapper: makeWrapper( queryClient ),
		} );

		act( () => {
			result.current.mutate( {
				feed_id: 456,
				url: 'https://example.com/feed',
				doNotInvalidateSiteSubscriptions: true,
			} );
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		const invalidatedKeys = invalidateQueries.mock.calls.map(
			( [ filters ] ) => filters?.queryKey
		);
		expect( invalidatedKeys ).toContainEqual( readFeedQueryKey( 456 ) );
		expect( invalidatedKeys ).not.toContainEqual( [ 'read', 'feeds', 456 ] );
	} );

	it( 'rolls back site subscription restore when subscribe fails', async () => {
		const queryClient = makeQueryClient();
		const previousData = makeSiteSubscriptionsData(
			[ makeSubscription( { is_following: false, isDeleted: true } ) ],
			0
		);
		queryClient.setQueryData( getSiteSubscriptionsQueryKey(), previousData );
		( callApi as jest.Mock ).mockRejectedValue( new Error( 'subscribe failed' ) );

		const { result } = renderHook( () => useSiteSubscribeMutation(), {
			wrapper: makeWrapper( queryClient ),
		} );

		act( () => {
			result.current.mutate( {
				blog_id: 123,
				url: 'https://example.com/feed',
				doNotInvalidateSiteSubscriptions: true,
			} );
		} );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );
		expect( queryClient.getQueryData( getSiteSubscriptionsQueryKey() ) ).toEqual( previousData );
	} );

	it( 'optimistically marks a site subscription deleted and decrements total count', async () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData(
			getSiteSubscriptionsQueryKey(),
			makeSiteSubscriptionsData( [ makeSubscription() ], 1 )
		);
		( callApi as jest.Mock ).mockResolvedValue( { subscribed: false } );

		const { result } = renderHook( () => useSiteUnsubscribeMutation(), {
			wrapper: makeWrapper( queryClient ),
		} );

		act( () => {
			result.current.mutate( {
				subscriptionId: 123,
				blog_id: 123,
				doNotInvalidateSiteSubscriptions: true,
			} );
		} );

		await waitFor( () => expect( callApi ).toHaveBeenCalled() );
		const page = getCachedSubscriptions( queryClient );
		expect( page?.totalCount ).toBe( 0 );
		expect( page?.subscriptions[ 0 ] ).toMatchObject( {
			is_following: false,
			isDeleted: true,
			resubscribed: false,
		} );
	} );

	it( 'does not decrement total count when unsubscribe cannot match a cached subscription', async () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData(
			getSiteSubscriptionsQueryKey(),
			makeSiteSubscriptionsData( [ makeSubscription( { ID: 456, blog_ID: 456 } ) ], 1 )
		);
		( callApi as jest.Mock ).mockResolvedValue( { subscribed: false } );

		const { result } = renderHook( () => useSiteUnsubscribeMutation(), {
			wrapper: makeWrapper( queryClient ),
		} );

		act( () => {
			result.current.mutate( {
				subscriptionId: 123,
				blog_id: 123,
				doNotInvalidateSiteSubscriptions: true,
			} );
		} );

		await waitFor( () => expect( callApi ).toHaveBeenCalled() );
		const page = getCachedSubscriptions( queryClient );
		expect( page?.totalCount ).toBe( 1 );
		expect( page?.subscriptions[ 0 ] ).toMatchObject( {
			is_following: true,
			isDeleted: false,
		} );
	} );

	it( 'invalidates the feed query so the subscribe button reflects the removed subscription', async () => {
		const queryClient = makeQueryClient();
		const invalidateQueries = jest.spyOn( queryClient, 'invalidateQueries' );
		( callApi as jest.Mock ).mockResolvedValue( { subscribed: false } );

		const { result } = renderHook( () => useSiteUnsubscribeMutation(), {
			wrapper: makeWrapper( queryClient ),
		} );

		act( () => {
			result.current.mutate( {
				subscriptionId: 123,
				feed_id: 456,
				doNotInvalidateSiteSubscriptions: true,
			} );
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		const invalidatedKeys = invalidateQueries.mock.calls.map(
			( [ filters ] ) => filters?.queryKey
		);
		expect( invalidatedKeys ).toContainEqual( readFeedQueryKey( 456 ) );
	} );

	it( 'rolls back site subscription delete when unsubscribe fails', async () => {
		const queryClient = makeQueryClient();
		const previousData = makeSiteSubscriptionsData( [ makeSubscription() ], 1 );
		queryClient.setQueryData( getSiteSubscriptionsQueryKey(), previousData );
		( callApi as jest.Mock ).mockRejectedValue( new Error( 'unsubscribe failed' ) );

		const { result } = renderHook( () => useSiteUnsubscribeMutation(), {
			wrapper: makeWrapper( queryClient ),
		} );

		act( () => {
			result.current.mutate( {
				subscriptionId: 123,
				blog_id: 123,
				doNotInvalidateSiteSubscriptions: true,
			} );
		} );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );
		expect( queryClient.getQueryData( getSiteSubscriptionsQueryKey() ) ).toEqual( previousData );
	} );
} );
