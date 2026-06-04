/**
 * @jest-environment jsdom
 */
import {
	getSiteSubscriptionsQueryKey,
	type SiteSubscriptionsInfiniteData,
} from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React, { act } from 'react';
import { SiteSubscriptionsSortBy } from '../../constants';
import {
	SiteSubscriptionsQueryPropsProvider,
	useSiteSubscriptionsQueryProps,
} from '../../contexts';
import { callApi, getSubkey } from '../../helpers';
import useSiteSubscriptionsQuery from '../../queries/use-site-subscriptions-query';
import type { SiteSubscriptionItem } from '../../types';

jest.mock( '../../helpers', () => ( {
	...jest.requireActual( '../../helpers' ),
	callApi: jest.fn(),
	getSubkey: jest.fn(),
} ) );

const queryClient = new QueryClient();

const wrapper = ( { children } ) => (
	<QueryClientProvider client={ queryClient }>
		<SiteSubscriptionsQueryPropsProvider>{ children }</SiteSubscriptionsQueryPropsProvider>
	</QueryClientProvider>
);

const makeFollow = ( overrides: Partial< SiteSubscriptionItem > = {} ): SiteSubscriptionItem => ( {
	ID: '1',
	URL: 'https://site1.example.com',
	feed_URL: 'https://site1.example.com/feed',
	blog_ID: '1',
	feed_ID: '11',
	is_following: true,
	name: 'Site 1',
	date_subscribed: new Date( '2024-01-01T00:00:00Z' ),
	last_updated: new Date( '2024-01-01T00:00:00Z' ),
	...overrides,
} );

const makeApiSubscription = ( id: number ) => ( {
	ID: String( id ),
	URL: `https://site${ id }.example.com/feed`,
	blog_ID: String( id ),
	feed_ID: String( id + 1000 ),
	name: `Site ${ id }`,
} );

const makeSiteSubscriptionsData = (
	pages: SiteSubscriptionItem[][],
	totalCount = pages.reduce( ( count, page ) => count + page.length, 0 )
): SiteSubscriptionsInfiniteData => ( {
	pages: pages.map( ( subscriptions, index ) => ( {
		subscriptions,
		totalCount,
		page: index + 1,
		number: 200,
	} ) ),
	pageParams: pages.map( ( _, index ) => index + 1 ),
} );

const seedSiteSubscriptions = ( pages: SiteSubscriptionItem[][], totalCount?: number ) => {
	queryClient.setQueryData< SiteSubscriptionsInfiniteData >(
		getSiteSubscriptionsQueryKey(),
		makeSiteSubscriptionsData( pages, totalCount )
	);
};

describe( 'useSiteSubscriptionsQuery hook', () => {
	beforeEach( () => {
		queryClient.clear();
		jest.resetAllMocks();

		( getSubkey as jest.Mock ).mockReturnValue( () => 'test-key' );
		( callApi as jest.Mock ).mockResolvedValue( {
			subscriptions: [],
			total_subscriptions: 0,
			page: 1,
			number: 200,
		} );
	} );

	it( 'derives subscriptions data from multiple cached pages', async () => {
		seedSiteSubscriptions( [
			[
				makeFollow( { ID: '1', name: 'Site 1', URL: 'https://site1.example.com' } ),
				makeFollow( { ID: '2', name: 'Site 2', URL: 'https://site2.example.com' } ),
			],
			[
				makeFollow( { ID: '3', name: 'Site 3', URL: 'https://site3.example.com' } ),
				makeFollow( { ID: '4', name: 'Site 4', URL: 'https://site4.example.com' } ),
			],
			[
				makeFollow( { ID: '5', name: 'Site 5', URL: 'https://site5.example.com' } ),
				makeFollow( { ID: '6', name: 'Site 6', URL: 'https://site6.example.com' } ),
			],
		] );

		const { result } = renderHook( () => useSiteSubscriptionsQuery(), {
			wrapper,
		} );

		await waitFor( () => {
			expect( result.current.data.subscriptions.length ).toBe( 6 );
			expect( result.current.data.totalCount ).toBe( 6 );
		} );
	} );

	it( 'fetches additional pages through the subkey-aware API path', async () => {
		const firstPage = Array.from( { length: 200 }, ( _value, index ) =>
			makeApiSubscription( index + 1 )
		);
		const secondPage = [ makeApiSubscription( 201 ) ];

		( callApi as jest.Mock ).mockImplementation( ( { path, isLoggedIn } ) => {
			expect( isLoggedIn ).toBe( false );

			if ( path.includes( 'page=1' ) ) {
				return Promise.resolve( {
					subscriptions: firstPage,
					total_subscriptions: 201,
					page: 1,
					number: 200,
				} );
			}

			if ( path.includes( 'page=2' ) ) {
				return Promise.resolve( {
					subscriptions: secondPage,
					total_subscriptions: 201,
					page: 2,
					number: 200,
				} );
			}

			throw new Error( `Unexpected path ${ path }` );
		} );

		const { result } = renderHook( () => useSiteSubscriptionsQuery(), {
			wrapper,
		} );

		await waitFor( () => expect( callApi ).toHaveBeenCalledTimes( 2 ) );
		await waitFor( () => expect( result.current.data.subscriptions ).toHaveLength( 201 ) );
		expect( ( callApi as jest.Mock ).mock.calls[ 0 ][ 0 ] ).toMatchObject( {
			apiVersion: '1.2',
			isLoggedIn: false,
		} );
		expect( ( callApi as jest.Mock ).mock.calls[ 0 ][ 0 ].path ).toContain(
			'/read/following/mine'
		);
	} );

	it( 'fetches subscriptions data with search term', async () => {
		seedSiteSubscriptions( [
			[
				makeFollow( { ID: '1', name: 'Site 1', URL: 'https://site1.example.com' } ),
				makeFollow( { ID: '2', name: 'Site 2', URL: 'https://site2.example.com' } ),
			],
		] );

		const { result } = renderHook(
			() => {
				const { setSearchTerm, searchTerm } = useSiteSubscriptionsQueryProps();
				const { data, isLoading } = useSiteSubscriptionsQuery();
				return { setSearchTerm, searchTerm, data, isLoading };
			},
			{
				wrapper,
			}
		);

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		act( () => result.current.setSearchTerm( 'te 1' ) );
		await waitFor( () => expect( result.current.searchTerm ).toBe( 'te 1' ) );

		expect( result.current.data.subscriptions.length ).toBe( 1 );
		expect( result.current.data.subscriptions[ 0 ].name ).toBe( 'Site 1' );
		expect( result.current.data.totalCount ).toBe( 2 );
	} );

	it( 'reuses fresh cached follows when remounted', async () => {
		seedSiteSubscriptions( [
			[ makeFollow( { ID: '1', name: 'Site 1', URL: 'https://site1.example.com' } ) ],
		] );

		const firstRender = renderHook( () => useSiteSubscriptionsQuery(), {
			wrapper,
		} );

		await waitFor( () => expect( firstRender.result.current.isLoading ).toBe( false ) );
		expect( firstRender.result.current.data.subscriptions ).toHaveLength( 1 );

		firstRender.unmount();

		const secondRender = renderHook( () => useSiteSubscriptionsQuery(), {
			wrapper,
		} );

		await waitFor( () =>
			expect( secondRender.result.current.data.subscriptions ).toHaveLength( 1 )
		);

		expect( secondRender.result.current.data.subscriptions ).toHaveLength( 1 );
	} );

	it.each( [
		{
			sortTerm: SiteSubscriptionsSortBy.SiteName,
			expectedResult: [
				{ ID: '2', name: "Arnold's site" },
				{ ID: '3', name: "Maciej's site" },
				{ ID: '1', name: "Zorro's site" },
			],
		},
		{
			sortTerm: SiteSubscriptionsSortBy.DateSubscribed,
			expectedResult: [
				{ ID: '3', date_subscribed: '2023-04-18T17:00:00+00:00' },
				{ ID: '2', date_subscribed: '2023-04-18T12:00:00+00:00' },
				{ ID: '1', date_subscribed: '2022-01-18T00:00:00+00:00' },
			],
		},
		{
			sortTerm: SiteSubscriptionsSortBy.LastUpdated,
			expectedResult: [
				{ ID: '1', last_updated: '2023-04-18T19:00:00+00:00' },
				{ ID: '3', last_updated: '2023-04-18T17:00:00+00:00' },
				{ ID: '2', last_updated: '2023-04-18T12:00:00+00:00' },
			],
		},
	] )( 'Applies sorting to the subscriptions returned', async ( { sortTerm, expectedResult } ) => {
		seedSiteSubscriptions( [
			[
				makeFollow( {
					ID: '1',
					name: "Zorro's site",
					URL: 'https://site2.example.com',
					date_subscribed: new Date( '2022-01-18T00:00:00+00:00' ),
					last_updated: new Date( '2023-04-18T19:00:00+00:00' ),
				} ),
				makeFollow( {
					ID: '3',
					name: "Maciej's site",
					URL: 'https://site2.example.com',
					date_subscribed: new Date( '2023-04-18T17:00:00+00:00' ),
					last_updated: new Date( '2023-04-18T17:00:00+00:00' ),
				} ),
				makeFollow( {
					ID: '2',
					name: "Arnold's site",
					URL: 'https://site1.example.com',
					date_subscribed: new Date( '2023-04-18T12:00:00+00:00' ),
					last_updated: new Date( '2023-04-18T12:00:00+00:00' ),
				} ),
			],
		] );

		const { result } = renderHook(
			() => {
				const { setSortTerm, sortTerm } = useSiteSubscriptionsQueryProps();
				const { data, isLoading } = useSiteSubscriptionsQuery();
				return { data, isLoading, setSortTerm, sortTerm };
			},
			{
				wrapper,
			}
		);

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
		act( () => result.current.setSortTerm( sortTerm ) );
		await waitFor( () => expect( result.current.sortTerm ).toBe( sortTerm ) );

		result.current.data.subscriptions.forEach( ( subscription, index ) => {
			expect( subscription.ID ).toEqual( expectedResult[ index ].ID );
		} );
	} );
} );
