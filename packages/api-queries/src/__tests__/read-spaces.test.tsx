import {
	keepPreviousData,
	QueryClient,
	QueryClientProvider,
	useMutation,
} from '@tanstack/react-query';
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

	describe( 'queries', () => {
		it( 'persists and keeps previous data for the spaces list query', () => {
			const options = readSpacesQuery();

			expect( options.queryKey ).toEqual( [ 'read', 'spaces', 'list' ] );
			expect( options.meta ).toEqual( { persist: true } );
			expect( options.placeholderData ).toBe( keepPreviousData );
			expect( options.refetchOnMount ).toBe( 'always' );
		} );

		it( 'persists space detail queries without bleeding the previous space', () => {
			const options = readSpaceQuery( '3' );

			expect( options.queryKey ).toEqual( [ 'read', 'spaces', 'detail', '3' ] );
			expect( options.meta ).toEqual( { persist: true } );
			// No keepPreviousData on the detail query: a spaceId change must not flash
			// the previous space's name/sources. Persisted cache + refetchOnMount keep
			// the same space visible during refetch.
			expect( options.placeholderData ).toBeUndefined();
			expect( options.refetchOnMount ).toBe( 'always' );
		} );
	} );

	describe( 'createReadSpaceMutation', () => {
		it( 'appends the summary to the list and seeds the detail cache', async () => {
			const client = newClient();
			const invalidateQueries = jest.spyOn( client, 'invalidateQueries' );
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
			expect( invalidateQueries ).toHaveBeenCalledWith( {
				queryKey: readSpacesQuery().queryKey,
			} );
			expect( invalidateQueries ).toHaveBeenCalledWith( {
				queryKey: readSpaceQuery( '99' ).queryKey,
			} );
		} );
	} );

	describe( 'updateReadSpaceMutation', () => {
		it( 'refreshes the matching list summary and the detail cache', async () => {
			const client = newClient();
			const invalidateQueries = jest.spyOn( client, 'invalidateQueries' );
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
			expect( invalidateQueries ).toHaveBeenCalledWith( {
				queryKey: readSpacesQuery().queryKey,
			} );
			expect( invalidateQueries ).toHaveBeenCalledWith( {
				queryKey: readSpaceQuery( '3' ).queryKey,
			} );
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
			const invalidateQueries = jest.spyOn( client, 'invalidateQueries' );
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
			expect( invalidateQueries ).toHaveBeenCalledWith( {
				queryKey: readSpacesQuery().queryKey,
			} );
		} );
	} );

	describe( 'feed (source) mutations', () => {
		it( 'writes the returned detail to the cache after adding a feed', async () => {
			const client = newClient();
			const resetQueries = jest.spyOn( client, 'resetQueries' );
			const invalidateQueries = jest.spyOn( client, 'invalidateQueries' );
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
			expect( resetQueries ).toHaveBeenCalledWith( {
				queryKey: getStreamInfiniteQueryKeyPrefix( 'space:3' ),
			} );
			expect( invalidateQueries ).toHaveBeenCalledWith( {
				queryKey: readSpaceQuery( '3' ).queryKey,
			} );
		} );

		it( 'writes the returned detail to the cache after removing a feed', async () => {
			const client = newClient();
			const invalidateQueries = jest.spyOn( client, 'invalidateQueries' );
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
			expect( invalidateQueries ).toHaveBeenCalledWith( {
				queryKey: readSpaceQuery( '3' ).queryKey,
			} );
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
