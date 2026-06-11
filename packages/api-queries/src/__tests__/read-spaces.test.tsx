import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import {
	addReadSpaceSourceMutation,
	createReadSpaceMutation,
	deleteReadSpaceSourceMutation,
	readSpaceQuery,
	readSpacesQuery,
} from '../read-spaces';
import type { ReadSpace, SiteSubscriptionItem } from '@automattic/api-core';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { ReactNode } from 'react';

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

// Drive the mutation through the real `useMutation` hook (matching the other
// api-queries tests) so `onMutate`/`onError`/`onSuccess` fire in order — the
// optimistic cache patch and rollback are the behavior under test.
//
// The error paths force a rejecting `mutationFn` because the Spaces mutators are
// still local no-ops with no network call. Once the real endpoints land, drop
// that override and drive success/error with a `nock` interceptor (200 vs
// 4xx/5xx), asserting `scope.isDone()` — see `read-site-recommendations.test.tsx`.
async function runMutation< TData, TVars, TContext >(
	client: QueryClient,
	mutation: UseMutationOptions< TData, Error, TVars, TContext >,
	variables: TVars
) {
	const { result } = renderHook( () => useMutation( mutation ), {
		wrapper: makeWrapper( client ),
	} );

	await act( async () => {
		await result.current.mutateAsync( variables ).catch( () => undefined );
	} );
}

const SPACE_ID = '2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21';

const STRATECHERY_SOURCE = {
	feedId: 456,
	blogId: 123,
	feedUrl: 'https://stratechery.com/feed',
	siteUrl: 'https://stratechery.com',
	name: 'Stratechery',
	siteIcon: 'https://stratechery.com/icon.png',
};

const makeSpace = ( overrides: Partial< ReadSpace > = {} ): ReadSpace => ( {
	id: SPACE_ID,
	name: 'Work',
	tags: [],
	color: 'blue',
	icon: 'inbox',
	sources: [],
	...overrides,
} );

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

const rejectingMutationFn = () => Promise.reject( new Error( 'nope' ) );

describe( 'read space source mutations', () => {
	it( 'optimistically adds a source from a site subscription to the matching space cache entry', async () => {
		const client = newClient();
		client.setQueryData( readSpacesQuery().queryKey, [ makeSpace() ] );

		await runMutation( client, addReadSpaceSourceMutation( client ), {
			spaceId: SPACE_ID,
			subscription: makeSubscription(),
		} );

		expect( client.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey ) ).toEqual( [
			expect.objectContaining( { id: SPACE_ID, sources: [ STRATECHERY_SOURCE ] } ),
		] );
	} );

	it( 'does not add the same subscription twice', async () => {
		const client = newClient();
		const subscription = makeSubscription();
		client.setQueryData( readSpacesQuery().queryKey, [ makeSpace() ] );

		await runMutation( client, addReadSpaceSourceMutation( client ), {
			spaceId: SPACE_ID,
			subscription,
		} );
		await runMutation( client, addReadSpaceSourceMutation( client ), {
			spaceId: SPACE_ID,
			subscription,
		} );

		const spaces = client.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
		expect( spaces?.[ 0 ].sources ).toHaveLength( 1 );
	} );

	it( 'does not clear the spaces cache when adding before the list is cached', async () => {
		const client = newClient();

		await runMutation( client, addReadSpaceSourceMutation( client ), {
			spaceId: SPACE_ID,
			subscription: makeSubscription(),
		} );

		expect( client.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey ) ).toEqual( [] );
	} );

	it( 'rolls back the optimistic add when the request fails', async () => {
		const client = newClient();
		client.setQueryData( readSpacesQuery().queryKey, [ makeSpace() ] );

		await runMutation(
			client,
			{ ...addReadSpaceSourceMutation( client ), mutationFn: rejectingMutationFn },
			{ spaceId: SPACE_ID, subscription: makeSubscription() }
		);

		const spaces = client.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
		expect( spaces?.[ 0 ].sources ).toEqual( [] );
	} );

	it( 'optimistically deletes a subscription from the matching space cache entry', async () => {
		const client = newClient();
		client.setQueryData( readSpacesQuery().queryKey, [
			makeSpace( { sources: [ STRATECHERY_SOURCE ] } ),
		] );

		await runMutation( client, deleteReadSpaceSourceMutation( client ), {
			spaceId: SPACE_ID,
			subscription: makeSubscription(),
		} );

		const spaces = client.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
		expect( spaces?.[ 0 ].sources ).toEqual( [] );
	} );

	it( 'deletes a source matched only by blog id', async () => {
		const client = newClient();
		client.setQueryData( readSpacesQuery().queryKey, [
			makeSpace( { sources: [ { ...STRATECHERY_SOURCE, feedId: null } ] } ),
		] );

		await runMutation( client, deleteReadSpaceSourceMutation( client ), {
			spaceId: SPACE_ID,
			subscription: makeSubscription( { feed_ID: null } ),
		} );

		const spaces = client.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
		expect( spaces?.[ 0 ].sources ).toEqual( [] );
	} );

	it( 'deletes a source matched only by feed url', async () => {
		const client = newClient();
		client.setQueryData( readSpacesQuery().queryKey, [
			makeSpace( { sources: [ { ...STRATECHERY_SOURCE, feedId: null, blogId: null } ] } ),
		] );

		await runMutation( client, deleteReadSpaceSourceMutation( client ), {
			spaceId: SPACE_ID,
			subscription: makeSubscription( { feed_ID: null, blog_ID: null } ),
		} );

		const spaces = client.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
		expect( spaces?.[ 0 ].sources ).toEqual( [] );
	} );

	it( 'does not clear the spaces cache when deleting before the list is cached', async () => {
		const client = newClient();

		await runMutation( client, deleteReadSpaceSourceMutation( client ), {
			spaceId: SPACE_ID,
			subscription: makeSubscription(),
		} );

		expect( client.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey ) ).toEqual( [] );
	} );

	it( 'rolls back the optimistic delete when the request fails', async () => {
		const client = newClient();
		client.setQueryData( readSpacesQuery().queryKey, [
			makeSpace( { sources: [ STRATECHERY_SOURCE ] } ),
		] );

		await runMutation(
			client,
			{ ...deleteReadSpaceSourceMutation( client ), mutationFn: rejectingMutationFn },
			{ spaceId: SPACE_ID, subscription: makeSubscription() }
		);

		const spaces = client.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
		expect( spaces?.[ 0 ].sources ).toEqual( [ STRATECHERY_SOURCE ] );
	} );
} );

describe( 'read space detail cache', () => {
	const detailSources = ( client: QueryClient ) =>
		client.getQueryData< ReadSpace >( readSpaceQuery( SPACE_ID ).queryKey )?.sources;

	it( 'seeds the list and detail caches when a space is created', async () => {
		const client = newClient();

		await runMutation( client, createReadSpaceMutation( client ), { name: 'New', tags: [] } );

		const spaces = client.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
		expect( spaces ).toHaveLength( 1 );

		const created = spaces![ 0 ];
		expect( client.getQueryData< ReadSpace >( readSpaceQuery( created.id ).queryKey ) ).toEqual(
			created
		);
	} );

	it( 'optimistically patches the detail cache when adding a source', async () => {
		const client = newClient();
		client.setQueryData( readSpaceQuery( SPACE_ID ).queryKey, makeSpace() );

		await runMutation( client, addReadSpaceSourceMutation( client ), {
			spaceId: SPACE_ID,
			subscription: makeSubscription(),
		} );

		expect( detailSources( client ) ).toEqual( [ STRATECHERY_SOURCE ] );
	} );

	it( 'optimistically patches the detail cache when deleting a source', async () => {
		const client = newClient();
		client.setQueryData(
			readSpaceQuery( SPACE_ID ).queryKey,
			makeSpace( { sources: [ STRATECHERY_SOURCE ] } )
		);

		await runMutation( client, deleteReadSpaceSourceMutation( client ), {
			spaceId: SPACE_ID,
			subscription: makeSubscription(),
		} );

		expect( detailSources( client ) ).toEqual( [] );
	} );

	it( 'rolls back the detail cache when the request fails', async () => {
		const client = newClient();
		client.setQueryData( readSpaceQuery( SPACE_ID ).queryKey, makeSpace() );

		await runMutation(
			client,
			{ ...addReadSpaceSourceMutation( client ), mutationFn: rejectingMutationFn },
			{ spaceId: SPACE_ID, subscription: makeSubscription() }
		);

		expect( detailSources( client ) ).toEqual( [] );
	} );
} );
