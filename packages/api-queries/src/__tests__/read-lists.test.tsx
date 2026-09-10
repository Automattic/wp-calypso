import { focusManager, QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { patchListsSeenCount, readSubscribedListsQuery } from '../read-lists';
import type { ReadList, ReadSubscribedListsResponse } from '@automattic/api-core';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';

const makeWrapper = ( client: QueryClient ) =>
	function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};

const newClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

const makeList = ( overrides: Partial< ReadList > = {} ): ReadList => ( {
	ID: 1,
	title: 'A list',
	slug: 'a-list',
	description: '',
	owner: 'me',
	is_owner: true,
	is_public: true,
	feeds: [],
	...overrides,
} );

const setData = ( client: QueryClient, lists: ReadList[], updatedAt?: number ) =>
	client.setQueryData< ReadSubscribedListsResponse >(
		readSubscribedListsQuery().queryKey,
		{ lists },
		{ updatedAt }
	);

const getData = ( client: QueryClient ) =>
	client.getQueryData< ReadSubscribedListsResponse >( readSubscribedListsQuery().queryKey );

describe( 'readSubscribedListsQuery freshness', () => {
	const mockLists = () =>
		nock( BASE ).get( '/rest/v1.2/read/lists' ).query( true ).reply( 200, { lists: [] } );

	afterEach( () => {
		focusManager.setFocused( undefined );
		nock.cleanAll();
	} );

	it( 'refetches on window focus when data is older than the seen-count max age', async () => {
		const client = newClient();
		setData( client, [], Date.now() - 31_000 );
		const request = mockLists();

		renderHook( () => useQuery( readSubscribedListsQuery() ), { wrapper: makeWrapper( client ) } );
		await focus();

		await waitFor( () => expect( request.isDone() ).toBe( true ) );
	} );

	it( 'does not refetch on window focus when data is fresh', async () => {
		const client = newClient();
		setData( client, [], Date.now() - 1_000 );
		const request = mockLists();

		renderHook( () => useQuery( readSubscribedListsQuery() ), { wrapper: makeWrapper( client ) } );
		await focus();

		expect( client.isFetching() ).toBe( 0 );
		expect( request.isDone() ).toBe( false );
	} );

	async function focus() {
		await act( async () => {
			focusManager.setFocused( false );
			focusManager.setFocused( true );
		} );
	}
} );

describe( 'patchListsSeenCount', () => {
	it( 'does not patch when the subscribed lists query has no cached data', () => {
		const client = newClient();

		patchListsSeenCount( client, [ 10 ], ( n ) => n - 1 );

		expect( getData( client ) ).toBeUndefined();
	} );

	it( 'does not patch when given an empty feed ids list', () => {
		const client = newClient();
		setData( client, [ makeList( { feeds: [ { feed_id: 10, unseen_count: 4 } ] } ) ] );

		patchListsSeenCount( client, [], ( n ) => n - 1 );

		expect( getData( client )?.lists[ 0 ].feeds[ 0 ].unseen_count ).toBe( 4 );
	} );

	it( 'applies the update to the matching feed and leaves others untouched', () => {
		const client = newClient();
		setData( client, [
			makeList( {
				ID: 1,
				feeds: [
					{ feed_id: 10, unseen_count: 5 },
					{ feed_id: 20, unseen_count: 2 },
				],
			} ),
		] );

		patchListsSeenCount( client, [ 10 ], ( n ) => n - 2 );

		const feeds = getData( client )?.lists[ 0 ].feeds;
		expect( feeds?.[ 0 ].unseen_count ).toBe( 3 );
		expect( feeds?.[ 1 ].unseen_count ).toBe( 2 );
	} );

	it( 'patches the same feed across every list that contains it', () => {
		const client = newClient();
		setData( client, [
			makeList( { ID: 1, feeds: [ { feed_id: 10, unseen_count: 4 } ] } ),
			makeList( { ID: 2, feeds: [ { feed_id: 10, unseen_count: 7 } ] } ),
		] );

		patchListsSeenCount( client, [ 10 ], () => 0 );

		const data = getData( client );
		expect( data?.lists[ 0 ].feeds[ 0 ].unseen_count ).toBe( 0 );
		expect( data?.lists[ 1 ].feeds[ 0 ].unseen_count ).toBe( 0 );
	} );

	it( 'patches every feed id in the set within a single list', () => {
		const client = newClient();
		setData( client, [
			makeList( {
				ID: 1,
				feeds: [
					{ feed_id: 10, unseen_count: 4 },
					{ feed_id: 20, unseen_count: 2 },
					{ feed_id: 30, unseen_count: 7 },
				],
			} ),
		] );

		patchListsSeenCount( client, [ 10, 30 ], () => 0 );

		const feeds = getData( client )?.lists[ 0 ].feeds;
		expect( feeds?.[ 0 ].unseen_count ).toBe( 0 );
		expect( feeds?.[ 1 ].unseen_count ).toBe( 2 );
		expect( feeds?.[ 2 ].unseen_count ).toBe( 0 );
	} );
} );
