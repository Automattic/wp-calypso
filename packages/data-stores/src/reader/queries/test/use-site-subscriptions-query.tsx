/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react-hooks';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import '@testing-library/jest-dom/extend-expect';
import { callApi, getSubkey } from '../../helpers';
import useSiteSubscriptionsQuery, {
	SiteSubscriptionsSortBy,
} from '../../queries/use-site-subscriptions-query';

jest.mock( '../../helpers', () => ( {
	callApi: jest.fn(),
	getSubkey: jest.fn(),
} ) );

const queryClient = new QueryClient();

const wrapper = ( { children } ) => (
	<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
);

describe( 'useSiteSubscriptionsQuery hook', () => {
	beforeEach( () => {
		queryClient.clear();
		jest.resetAllMocks();

		( getSubkey as jest.Mock ).mockReturnValue( () => 'test-key' );
	} );

	it( 'fetches subscriptions data with multiple pages', async () => {
		( callApi as jest.Mock ).mockResolvedValueOnce( {
			subscriptions: [
				{ id: '1', name: 'Site 1', URL: 'https://site1.example.com' },
				{ id: '2', name: 'Site 2', URL: 'https://site2.example.com' },
			],
			page: 1,
			total_subscriptions: 6,
		} );
		( callApi as jest.Mock ).mockResolvedValueOnce( {
			subscriptions: [
				{ id: '3', name: 'Site 3', URL: 'https://site3.example.com' },
				{ id: '4', name: 'Site 4', URL: 'https://site4.example.com' },
			],
			page: 2,
			total_subscriptions: 6,
		} );
		( callApi as jest.Mock ).mockResolvedValueOnce( {
			subscriptions: [
				{ id: '5', name: 'Site 5', URL: 'https://site5.example.com' },
				{ id: '6', name: 'Site 6', URL: 'https://site6.example.com' },
			],
			page: 3,
			total_subscriptions: 6,
		} );

		const { result, waitFor } = renderHook( () => useSiteSubscriptionsQuery( { number: 2 } ), {
			wrapper,
		} );

		expect( result.current.isLoading ).toBe( true );

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		await waitFor( () => expect( callApi ).toHaveBeenCalledTimes( 3 ) );

		expect( callApi ).toHaveBeenCalledTimes( 3 );
		expect( result.current.data.subscriptions.length ).toBe( 6 );
		expect( result.current.data.totalCount ).toBe( 6 );
	} );

	it( 'fetches subscriptions data with search term', async () => {
		( callApi as jest.Mock ).mockResolvedValue( {
			subscriptions: [
				{ id: '1', name: 'Site 1', URL: 'https://site1.example.com' },
				{ id: '2', name: 'Site 2', URL: 'https://site2.example.com' },
			],
			page: 1,
			total_subscriptions: 2,
		} );

		const { result, waitFor } = renderHook(
			() => useSiteSubscriptionsQuery( { searchTerm: 'Site 1' } ),
			{ wrapper }
		);

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		expect( callApi ).toHaveBeenCalledTimes( 1 );
		expect( result.current.data.subscriptions.length ).toBe( 1 );
		expect( result.current.data.totalCount ).toBe( 2 );
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
		( callApi as jest.Mock ).mockResolvedValue( {
			subscriptions: [
				{
					ID: '1',
					name: "Zorro's site",
					URL: 'https://site2.example.com',
					date_subscribed: '2022-01-18T00:00:00+00:00',
					last_updated: '2023-04-18T19:00:00+00:00',
				},
				{
					ID: '3',
					name: "Maciej's site",
					URL: 'https://site2.example.com',
					date_subscribed: '2023-04-18T17:00:00+00:00',
					last_updated: '2023-04-18T17:00:00+00:00',
				},
				{
					ID: '2',
					name: "Arnold's site",
					URL: 'https://site1.example.com',
					date_subscribed: '2023-04-18T12:00:00+00:00',
					last_updated: '2023-04-18T12:00:00+00:00',
				},
			],
			page: 1,
			total_subscriptions: 3,
		} );

		const { result, waitFor } = renderHook( () => useSiteSubscriptionsQuery( { sortTerm } ), {
			wrapper,
		} );

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );

		expect( callApi ).toHaveBeenCalledTimes( 1 );
		result.current.data.subscriptions.forEach( ( subscription, index ) => {
			expect( subscription.ID ).toEqual( expectedResult[ index ].ID );
		} );
	} );
} );
