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
	readSpaceBySlugQuery,
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
	slug: 'work',
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

		it( 'does not retry a space detail 4xx but still retries other failures', () => {
			const { retry } = readSpaceQuery( '3' );
			expect( typeof retry ).toBe( 'function' );
			const retryFn = retry as ( failureCount: number, error: unknown ) => boolean;
			const wpError = ( status: number ) =>
				Object.assign( new Error( `HTTP ${ status }` ), { status, statusCode: status } );

			expect( retryFn( 0, wpError( 404 ) ) ).toBe( false );
			expect( retryFn( 0, wpError( 403 ) ) ).toBe( false );
			expect( retryFn( 0, wpError( 500 ) ) ).toBe( true );
			expect( retryFn( 0, new Error( 'network' ) ) ).toBe( true );
			expect( retryFn( 3, wpError( 500 ) ) ).toBe( false );
		} );

		it( 'keys the by-slug detail query on the slug and does not retry a 4xx', () => {
			const options = readSpaceBySlugQuery( 'work' );

			expect( options.queryKey ).toEqual( [ 'read', 'spaces', 'detail-by-slug', 'work' ] );
			expect( options.meta ).toEqual( { persist: true } );
			expect( options.refetchOnMount ).toBe( 'always' );

			const retryFn = options.retry as ( failureCount: number, error: unknown ) => boolean;
			const notFound = Object.assign( new Error( 'HTTP 404' ), { status: 404, statusCode: 404 } );
			expect( retryFn( 0, notFound ) ).toBe( false );
		} );

		it( 'keys the by-slug query canonically, so encoded and decoded slugs share a key', () => {
			// The view passes the decoded route slug; the sidebar/mutations pass the
			// encoded API slug. Both must land on the same cache entry.
			const encoded = readSpaceBySlugQuery( '%d0%bf%d1%80%d0%b8%d0%b2%d0%b5%d1%82' ).queryKey;
			const decoded = readSpaceBySlugQuery( 'привет' ).queryKey;

			expect( encoded ).toEqual( [ 'read', 'spaces', 'detail-by-slug', 'привет' ] );
			expect( encoded ).toEqual( decoded );
		} );
	} );

	describe( 'createReadSpaceMutation', () => {
		it( 'appends the summary to the list and seeds the detail cache', async () => {
			const client = newClient();
			const invalidateQueries = jest.spyOn( client, 'invalidateQueries' );
			nock( BASE )
				.post( '/wpcom/v2/reader/spaces' )
				.reply( 201, detailResponse( { id: 99, slug: 'new', title: 'New' } ) );

			await runMutation( client, createReadSpaceMutation( client ), { name: 'New' } );

			expect( client.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey ) ).toEqual( [
				{ id: '99', slug: 'new', name: 'New', layout: { color: 'blue', icon: 'inbox' } },
			] );
			const createdDetail = {
				id: '99',
				slug: 'new',
				name: 'New',
				layout: { color: 'blue', icon: 'inbox' },
				sources: [],
				tags: [],
				languages: [],
			};
			expect( client.getQueryData< ReadSpaceDetails >( readSpaceQuery( '99' ).queryKey ) ).toEqual(
				createdDetail
			);
			// The by-slug detail cache is seeded too, so a slug-addressed view of the new
			// space paints from cache without a round-trip.
			expect(
				client.getQueryData< ReadSpaceDetails >( readSpaceBySlugQuery( 'new' ).queryKey )
			).toEqual( createdDetail );
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
				{ id: '3', slug: 'old', name: 'Old', layout: { color: 'blue', icon: 'inbox' } },
			] );
			nock( BASE )
				.put( '/wpcom/v2/reader/spaces/3' )
				.reply(
					200,
					detailResponse( {
						id: 3,
						slug: 'new-name',
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
				{ id: '3', slug: 'new-name', name: 'New name', layout: { color: 'green', icon: 'inbox' } },
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

		it( 'on a rename seeds the new by-slug cache and drops the old one', async () => {
			const client = newClient();
			client.setQueryData< ReadSpace[] >( readSpacesQuery().queryKey, [
				{ id: '3', slug: 'old', name: 'Old', layout: { color: 'blue', icon: 'inbox' } },
			] );
			// The view was resolving through the old slug, so that cache exists.
			client.setQueryData(
				readSpaceBySlugQuery( 'old' ).queryKey,
				detailResponse( { slug: 'old' } )
			);
			nock( BASE )
				.put( '/wpcom/v2/reader/spaces/3' )
				.reply( 200, detailResponse( { id: 3, slug: 'new-name', title: 'New name' } ) );

			await runMutation( client, updateReadSpaceMutation( client ), {
				spaceId: '3',
				params: { name: 'New name' },
			} );

			// The new slug is seeded (seamless redirect target)...
			expect(
				client.getQueryData< ReadSpaceDetails >( readSpaceBySlugQuery( 'new-name' ).queryKey )
			).toMatchObject( { id: '3', slug: 'new-name' } );
			// ...and the stale old-slug entry is removed.
			expect(
				client.getQueryData< ReadSpaceDetails >( readSpaceBySlugQuery( 'old' ).queryKey )
			).toBeUndefined();
		} );

		it( 'optimistically patches the list summary before the server responds', async () => {
			const client = newClient();
			client.setQueryData< ReadSpace[] >( readSpacesQuery().queryKey, [
				{
					id: '3',
					slug: 'old',
					name: 'Old',
					layout: { color: 'blue', icon: 'inbox', iconColor: 'blue' },
				},
			] );

			// Run just `onMutate` — the sidebar reads this list, so the icon/colour must
			// update from the mutation variables without waiting for the round-trip.
			await updateReadSpaceMutation( client ).onMutate?.( {
				spaceId: '3',
				params: { name: 'New', layout: { icon: 'star', iconColor: 'pink' } },
			} );

			// `layout` is merged (color kept, icon/iconColor overridden), name replaced. The
			// slug isn't touched optimistically — the server re-derives it and onSuccess
			// writes the canonical value.
			expect( client.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey ) ).toEqual( [
				{
					id: '3',
					slug: 'old',
					name: 'New',
					layout: { color: 'blue', icon: 'star', iconColor: 'pink' },
				},
			] );
		} );

		it( 'rolls back the optimistic list patch when the update fails', async () => {
			const client = newClient();
			const seeded: ReadSpace[] = [
				{
					id: '3',
					slug: 'old',
					name: 'Old',
					layout: { color: 'blue', icon: 'inbox', iconColor: 'blue' },
				},
			];
			client.setQueryData< ReadSpace[] >( readSpacesQuery().queryKey, seeded );
			nock( BASE ).put( '/wpcom/v2/reader/spaces/3' ).reply( 500, { error: 'boom' } );

			await runMutation( client, updateReadSpaceMutation( client ), {
				spaceId: '3',
				params: { name: 'New', layout: { icon: 'star', iconColor: 'pink' } },
			} );

			// The optimistic patch is reverted to the pre-mutation summary.
			expect( client.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey ) ).toEqual( seeded );
		} );

		it( "resets both of the space's streams so they reload after a tag/feed/language edit", async () => {
			const client = newClient();
			const spy = jest.spyOn( client, 'resetQueries' );
			nock( BASE )
				.put( '/wpcom/v2/reader/spaces/3' )
				.reply( 200, detailResponse( { id: 3, tags: [ 'x' ] } ) );

			await runMutation( client, updateReadSpaceMutation( client ), {
				spaceId: '3',
				params: { tags: [ 'x' ] },
			} );

			// Both the posts feed and Discover reload — Discover is filtered by the
			// space's languages, so a language change must not leave it cached.
			expect( spy ).toHaveBeenCalledWith( {
				queryKey: getStreamInfiniteQueryKeyPrefix( 'space:3' ),
			} );
			expect( spy ).toHaveBeenCalledWith( {
				queryKey: getStreamInfiniteQueryKeyPrefix( 'space_discover:3' ),
			} );
		} );
	} );

	describe( 'deleteReadSpaceMutation', () => {
		it( 'removes the deleted space from the list and discards its detail cache', async () => {
			const client = newClient();
			const invalidateQueries = jest.spyOn( client, 'invalidateQueries' );
			const keep: ReadSpace = {
				id: 'keep',
				slug: 'keep',
				name: 'Keep',
				layout: { color: 'red', icon: 'box' },
			};
			client.setQueryData< ReadSpace[] >( readSpacesQuery().queryKey, [
				keep,
				{ id: '3', slug: 'work', name: 'Work', layout: { color: 'blue', icon: 'inbox' } },
			] );
			client.setQueryData( readSpaceQuery( '3' ).queryKey, detailResponse() );
			client.setQueryData( readSpaceBySlugQuery( 'work' ).queryKey, detailResponse() );
			nock( BASE ).delete( '/wpcom/v2/reader/spaces/3' ).reply( 200, { deleted: true, id: 3 } );

			await runMutation( client, deleteReadSpaceMutation( client ), '3' );

			expect( client.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey ) ).toEqual( [
				keep,
			] );
			expect(
				client.getQueryData< ReadSpaceDetails >( readSpaceQuery( '3' ).queryKey )
			).toBeUndefined();
			// The by-slug detail cache is discarded as well.
			expect(
				client.getQueryData< ReadSpaceDetails >( readSpaceBySlugQuery( 'work' ).queryKey )
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
			expect( resetQueries ).toHaveBeenCalledWith( {
				queryKey: getStreamInfiniteQueryKeyPrefix( 'space_discover:3' ),
			} );
			expect( invalidateQueries ).toHaveBeenCalledWith( {
				queryKey: readSpaceQuery( '3' ).queryKey,
			} );
		} );

		it( 'writes the returned detail to the cache after removing a feed', async () => {
			const client = newClient();
			const resetQueries = jest.spyOn( client, 'resetQueries' );
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
			// Removing a feed reloads both streams, same as adding one.
			expect( resetQueries ).toHaveBeenCalledWith( {
				queryKey: getStreamInfiniteQueryKeyPrefix( 'space:3' ),
			} );
			expect( resetQueries ).toHaveBeenCalledWith( {
				queryKey: getStreamInfiniteQueryKeyPrefix( 'space_discover:3' ),
			} );
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
				languages: [],
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
