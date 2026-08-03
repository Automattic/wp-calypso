import { QueryClient } from '@tanstack/react-query';
import { patchListsSeenCount, readSubscribedListsQuery } from '../read-lists';
import type { ReadList, ReadSubscribedListsResponse } from '@automattic/api-core';

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

const setData = ( client: QueryClient, lists: ReadList[] ) =>
	client.setQueryData< ReadSubscribedListsResponse >( readSubscribedListsQuery().queryKey, {
		lists,
	} );

const getData = ( client: QueryClient ) =>
	client.getQueryData< ReadSubscribedListsResponse >( readSubscribedListsQuery().queryKey );

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
