import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import nock from 'nock';
import {
	addReadSpaceSourceMutation,
	createReadSpaceMutation,
	deleteReadSpaceMutation,
	deleteReadSpaceSourceMutation,
	readSpaceQuery,
	readSpacesQuery,
	updateReadSpaceMutation,
} from '../read-spaces';
import { getStreamInfiniteQueryKeyPrefix } from '../read-streams';
import type { ReadSpace, ReadSpaceDetails, SiteSubscriptionItem } from '@automattic/api-core';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';

function makeWrapper( client: QueryClient ) {
	return function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};
}

function newClient() {
	return new QueryClient( {
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	} );
}

// Drive the mutation through the real `useMutation` hook so its onSuccess fires.
async function runMutation< TData, TError, TVars, TContext >(
	client: QueryClient,
	mutation: UseMutationOptions< TData, TError, TVars, TContext >,
	variables: TVars
) {
	const { result } = renderHook( () => useMutation( mutation ), {
		wrapper: makeWrapper( client ),
	} );

	await act( async () => {
		await result.current.mutateAsync( variables ).catch( () => undefined );
	} );
}

const makeSubscription = (
	overrides: Partial< SiteSubscriptionItem > = {}
): SiteSubscriptionItem => ( {
	ID: 1,
	URL: 'https://stratechery.com',
	feed_URL: 'https://stratechery.com/feed',
	blog_ID: 123,
	feed_ID: 456,
	name: 'Stratechery',
	site_icon: 'https://stratechery.com/icon.png',
	is_following: true,
	...overrides,
} );

// A detail wire response (create/update/add-feed/remove-feed all return one).
const detailResponse = ( overrides: Record< string, unknown > = {} ) => ( {
	id: 3,
	title: 'Work',
	layout: { color: 'blue', icon: 'inbox' },
	follows: [],
	tags: [],
	...overrides,
} );

describe( 'read spaces mutations', () => {
	afterEach( () => nock.cleanAll() );

	describe( 'createReadSpaceMutation', () => {
		it( 'appends the summary to the list and seeds the detail cache', async () => {
			const client = newClient();
			nock( BASE )
				.post( '/wpcom/v2/reader/spaces' )
				.reply( 201, detailResponse( { id: 99, title: 'New' } ) );

			await runMutation( client, createReadSpaceMutation( client ), { name: 'New' } );

			expect( client.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey ) ).toEqual( [
				{ id: '99', name: 'New', layout: { color: 'blue', icon: 'inbox' } },
			] );
			expect( client.getQueryData< ReadSpaceDetails >( readSpaceQuery( '99' ).queryKey ) ).toEqual(
				{
					id: '99',
					name: 'New',
					layout: { color: 'blue', icon: 'inbox' },
					sources: [],
					tags: [],
				}
			);
		} );
	} );

	describe( 'updateReadSpaceMutation', () => {
		it( 'refreshes the matching list summary and the detail cache', async () => {
			const client = newClient();
			client.setQueryData< ReadSpace[] >( readSpacesQuery().queryKey, [
				{ id: '3', name: 'Old', layout: { color: 'blue', icon: 'inbox' } },
			] );
			nock( BASE )
				.put( '/wpcom/v2/reader/spaces/3' )
				.reply(
					200,
					detailResponse( {
						id: 3,
						title: 'New name',
						layout: { color: 'green', icon: 'inbox' },
						tags: [ 'x' ],
					} )
				);

			await runMutation( client, updateReadSpaceMutation( client ), {
				spaceId: '3',
				params: { name: 'New name' },
			} );

			expect( client.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey ) ).toEqual( [
				{ id: '3', name: 'New name', layout: { color: 'green', icon: 'inbox' } },
			] );
			expect(
				client.getQueryData< ReadSpaceDetails >( readSpaceQuery( '3' ).queryKey )
			).toMatchObject( { id: '3', name: 'New name', tags: [ 'x' ] } );
		} );

		it( "resets the space's posts feed so it reloads after a tag/feed edit", async () => {
			const client = newClient();
			const spy = jest.spyOn( client, 'resetQueries' );
			nock( BASE )
				.put( '/wpcom/v2/reader/spaces/3' )
				.reply( 200, detailResponse( { id: 3, tags: [ 'x' ] } ) );

			await runMutation( client, updateReadSpaceMutation( client ), {
				spaceId: '3',
				params: { tags: [ 'x' ] },
			} );

			expect( spy ).toHaveBeenCalledWith( {
				queryKey: getStreamInfiniteQueryKeyPrefix( 'space:3' ),
			} );
		} );
	} );

	describe( 'deleteReadSpaceMutation', () => {
		it( 'removes the deleted space from the list and discards its detail cache', async () => {
			const client = newClient();
			const keep: ReadSpace = { id: 'keep', name: 'Keep', layout: { color: 'red', icon: 'box' } };
			client.setQueryData< ReadSpace[] >( readSpacesQuery().queryKey, [
				keep,
				{ id: '3', name: 'Work', layout: { color: 'blue', icon: 'inbox' } },
			] );
			client.setQueryData( readSpaceQuery( '3' ).queryKey, detailResponse() );
			nock( BASE ).delete( '/wpcom/v2/reader/spaces/3' ).reply( 200, { deleted: true, id: 3 } );

			await runMutation( client, deleteReadSpaceMutation( client ), '3' );

			expect( client.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey ) ).toEqual( [
				keep,
			] );
			expect(
				client.getQueryData< ReadSpaceDetails >( readSpaceQuery( '3' ).queryKey )
			).toBeUndefined();
		} );
	} );

	describe( 'feed (source) mutations', () => {
		it( 'writes the returned detail to the cache after adding a feed', async () => {
			const client = newClient();
			const spy = jest.spyOn( client, 'resetQueries' );
			nock( BASE )
				.post( '/wpcom/v2/reader/spaces/3/feeds' )
				.reply(
					200,
					detailResponse( {
						follows: [
							{
								feed_id: 456,
								feed_url: 'https://stratechery.com/feed',
								blog_id: 123,
								name: 'Stratechery',
								icon: null,
							},
						],
					} )
				);

			await runMutation( client, addReadSpaceSourceMutation( client ), {
				spaceId: '3',
				subscription: makeSubscription(),
			} );

			expect(
				client.getQueryData< ReadSpaceDetails >( readSpaceQuery( '3' ).queryKey )?.sources
			).toEqual( [
				{
					feedId: 456,
					feedUrl: 'https://stratechery.com/feed',
					blogId: 123,
					name: 'Stratechery',
					siteIcon: null,
				},
			] );
			expect( spy ).toHaveBeenCalledWith( {
				queryKey: getStreamInfiniteQueryKeyPrefix( 'space:3' ),
			} );
		} );

		it( 'writes the returned detail to the cache after removing a feed', async () => {
			const client = newClient();
			nock( BASE )
				.delete( '/wpcom/v2/reader/spaces/3/feeds/456' )
				.reply( 200, detailResponse( { follows: [] } ) );

			await runMutation( client, deleteReadSpaceSourceMutation( client ), {
				spaceId: '3',
				subscription: makeSubscription(),
			} );

			expect(
				client.getQueryData< ReadSpaceDetails >( readSpaceQuery( '3' ).queryKey )?.sources
			).toEqual( [] );
		} );

		it( 'leaves the detail cache untouched when the add request fails', async () => {
			const client = newClient();
			const seeded: ReadSpaceDetails = {
				id: '3',
				name: 'Work',
				layout: { color: 'blue', icon: 'inbox' },
				sources: [],
				tags: [],
			};
			client.setQueryData( readSpaceQuery( '3' ).queryKey, seeded );
			nock( BASE )
				.post( '/wpcom/v2/reader/spaces/3/feeds' )
				.reply( 409, {
					code: 'reader_spaces_duplicate_feed',
					message: '…',
					data: { status: 409 },
				} );

			await runMutation( client, addReadSpaceSourceMutation( client ), {
				spaceId: '3',
				subscription: makeSubscription(),
			} );

			expect( client.getQueryData< ReadSpaceDetails >( readSpaceQuery( '3' ).queryKey ) ).toEqual(
				seeded
			);
		} );
	} );
} );
