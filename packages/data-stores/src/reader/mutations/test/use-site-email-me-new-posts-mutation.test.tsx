/**
 * @jest-environment jsdom
 */
import {
	getSiteSubscriptionsQueryKey,
	type SiteSubscriptionsInfiniteData,
} from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { EmailDeliveryFrequency } from '../../constants';
import { callApi } from '../../helpers';
import useSiteEmailMeNewPostsMutation from '../../mutations/use-site-email-me-new-posts-mutation';
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
): SiteSubscriptionItem =>
	( {
		ID: 123,
		URL: 'https://example.com',
		feed_URL: 'https://example.com/feed',
		blog_ID: 123,
		feed_ID: 456,
		is_following: true,
		isDeleted: false,
		delivery_methods: {
			email: {
				send_posts: true,
				post_delivery_frequency: EmailDeliveryFrequency.Weekly,
			},
		},
		...overrides,
	} ) as SiteSubscriptionItem;

const makeSiteSubscriptionsData = (
	subscriptions: SiteSubscriptionItem[]
): SiteSubscriptionsInfiniteData => ( {
	pages: [
		{
			subscriptions,
			totalCount: subscriptions.length,
			page: 1,
			number: 200,
		},
	],
	pageParams: [ 1 ],
} );

const getCachedEmail = ( queryClient: QueryClient ) =>
	queryClient.getQueryData< SiteSubscriptionsInfiniteData >( getSiteSubscriptionsQueryKey() )
		?.pages[ 0 ]?.subscriptions[ 0 ]?.delivery_methods?.email;

describe( 'useSiteEmailMeNewPostsMutation()', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'clears the stored delivery frequency when email delivery is turned off', async () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData(
			getSiteSubscriptionsQueryKey(),
			makeSiteSubscriptionsData( [ makeSubscription() ] )
		);
		( callApi as jest.Mock ).mockResolvedValue( { success: true, subscribed: false } );

		const { result } = renderHook( () => useSiteEmailMeNewPostsMutation(), {
			wrapper: makeWrapper( queryClient ),
		} );

		act( () => {
			result.current.mutate( { blog_id: 123, send_posts: false, subscriptionId: 123 } );
		} );

		await waitFor( () => expect( callApi ).toHaveBeenCalled() );
		const email = getCachedEmail( queryClient );
		expect( email?.send_posts ).toBe( false );
		expect( email?.post_delivery_frequency ).toBeUndefined();
	} );

	it( 'preserves the stored delivery frequency when email delivery is turned on', async () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData(
			getSiteSubscriptionsQueryKey(),
			makeSiteSubscriptionsData( [
				makeSubscription( {
					delivery_methods: {
						email: { send_posts: false, post_delivery_frequency: EmailDeliveryFrequency.Weekly },
					},
				} ),
			] )
		);
		( callApi as jest.Mock ).mockResolvedValue( { success: true, subscribed: true } );

		const { result } = renderHook( () => useSiteEmailMeNewPostsMutation(), {
			wrapper: makeWrapper( queryClient ),
		} );

		act( () => {
			result.current.mutate( { blog_id: 123, send_posts: true, subscriptionId: 123 } );
		} );

		await waitFor( () => expect( callApi ).toHaveBeenCalled() );
		const email = getCachedEmail( queryClient );
		expect( email?.send_posts ).toBe( true );
		expect( email?.post_delivery_frequency ).toBe( EmailDeliveryFrequency.Weekly );
	} );

	it( 'rolls back the optimistic update when the request fails', async () => {
		const queryClient = makeQueryClient();
		const previousData = makeSiteSubscriptionsData( [ makeSubscription() ] );
		queryClient.setQueryData( getSiteSubscriptionsQueryKey(), previousData );
		( callApi as jest.Mock ).mockRejectedValue( new Error( 'request failed' ) );

		const { result } = renderHook( () => useSiteEmailMeNewPostsMutation(), {
			wrapper: makeWrapper( queryClient ),
		} );

		act( () => {
			result.current.mutate( { blog_id: 123, send_posts: false, subscriptionId: 123 } );
		} );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );
		expect( queryClient.getQueryData( getSiteSubscriptionsQueryKey() ) ).toEqual( previousData );
	} );
} );
