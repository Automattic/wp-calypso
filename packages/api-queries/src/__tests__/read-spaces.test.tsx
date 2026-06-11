import { MutationObserver, QueryClient } from '@tanstack/react-query';
import {
	addReadSpaceSourceMutation,
	deleteReadSpaceSourceMutation,
	readSpacesQuery,
} from '../read-spaces';
import type {
	ReadSpace,
	ReadSpaceSourceMutationParams,
	SiteSubscriptionItem,
} from '@automattic/api-core';
import type { UseMutationOptions } from '@tanstack/react-query';

const STRATECHERY_SOURCE = {
	feedId: 456,
	blogId: 123,
	feedUrl: 'https://stratechery.com/feed',
	siteUrl: 'https://stratechery.com',
	name: 'Stratechery',
	siteIcon: 'https://stratechery.com/icon.png',
};

// Run the mutation through its real lifecycle so `onMutate`/`onError`/`onSuccess`
// fire in order — the optimistic patch and rollback are the behavior under test.
// `mutationFnOverride` lets a test force the (stubbed) request to reject.
async function runMutation(
	queryClient: QueryClient,
	options: UseMutationOptions< void, Error, ReadSpaceSourceMutationParams, unknown >,
	variables: ReadSpaceSourceMutationParams,
	mutationFnOverride?: () => Promise< void >
) {
	const observer = new MutationObserver( queryClient, {
		...options,
		...( mutationFnOverride ? { mutationFn: mutationFnOverride } : {} ),
	} );
	await observer.mutate( variables ).catch( () => undefined );
}

const SPACE_ID = '2f5d8f28-04b7-4f6a-a908-6c4d2b4b8f21';

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

describe( 'read space source mutations', () => {
	it( 'optimistically adds a source from a site subscription to the matching space cache entry', async () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( readSpacesQuery().queryKey, [ makeSpace() ] );

		await runMutation( queryClient, addReadSpaceSourceMutation( queryClient ), {
			spaceId: SPACE_ID,
			subscription: makeSubscription(),
		} );

		expect( queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey ) ).toEqual( [
			expect.objectContaining( {
				id: SPACE_ID,
				sources: [ STRATECHERY_SOURCE ],
			} ),
		] );
	} );

	it( 'does not add the same subscription twice', async () => {
		const queryClient = new QueryClient();
		const subscription = makeSubscription();
		queryClient.setQueryData( readSpacesQuery().queryKey, [ makeSpace() ] );

		await runMutation( queryClient, addReadSpaceSourceMutation( queryClient ), {
			spaceId: SPACE_ID,
			subscription,
		} );
		await runMutation( queryClient, addReadSpaceSourceMutation( queryClient ), {
			spaceId: SPACE_ID,
			subscription,
		} );

		const spaces = queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
		expect( spaces?.[ 0 ].sources ).toHaveLength( 1 );
	} );

	it( 'does not clear the spaces cache when adding before the list is cached', async () => {
		const queryClient = new QueryClient();

		await runMutation( queryClient, addReadSpaceSourceMutation( queryClient ), {
			spaceId: SPACE_ID,
			subscription: makeSubscription(),
		} );

		expect( queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey ) ).toEqual( [] );
	} );

	it( 'rolls back the optimistic add when the request fails', async () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( readSpacesQuery().queryKey, [ makeSpace() ] );

		await runMutation(
			queryClient,
			addReadSpaceSourceMutation( queryClient ),
			{ spaceId: SPACE_ID, subscription: makeSubscription() },
			() => Promise.reject( new Error( 'nope' ) )
		);

		const spaces = queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
		expect( spaces?.[ 0 ].sources ).toEqual( [] );
	} );

	it( 'optimistically deletes a subscription from the matching space cache entry', async () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( readSpacesQuery().queryKey, [
			makeSpace( { sources: [ STRATECHERY_SOURCE ] } ),
		] );

		await runMutation( queryClient, deleteReadSpaceSourceMutation( queryClient ), {
			spaceId: SPACE_ID,
			subscription: makeSubscription(),
		} );

		const spaces = queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
		expect( spaces?.[ 0 ].sources ).toEqual( [] );
	} );

	it( 'deletes a source matched only by blog id', async () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( readSpacesQuery().queryKey, [
			makeSpace( {
				sources: [ { ...STRATECHERY_SOURCE, feedId: null } ],
			} ),
		] );

		await runMutation( queryClient, deleteReadSpaceSourceMutation( queryClient ), {
			spaceId: SPACE_ID,
			subscription: makeSubscription( { feed_ID: null } ),
		} );

		const spaces = queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
		expect( spaces?.[ 0 ].sources ).toEqual( [] );
	} );

	it( 'deletes a source matched only by feed url', async () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( readSpacesQuery().queryKey, [
			makeSpace( {
				sources: [ { ...STRATECHERY_SOURCE, feedId: null, blogId: null } ],
			} ),
		] );

		await runMutation( queryClient, deleteReadSpaceSourceMutation( queryClient ), {
			spaceId: SPACE_ID,
			subscription: makeSubscription( { feed_ID: null, blog_ID: null } ),
		} );

		const spaces = queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
		expect( spaces?.[ 0 ].sources ).toEqual( [] );
	} );

	it( 'does not clear the spaces cache when deleting before the list is cached', async () => {
		const queryClient = new QueryClient();

		await runMutation( queryClient, deleteReadSpaceSourceMutation( queryClient ), {
			spaceId: SPACE_ID,
			subscription: makeSubscription(),
		} );

		expect( queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey ) ).toEqual( [] );
	} );

	it( 'rolls back the optimistic delete when the request fails', async () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( readSpacesQuery().queryKey, [
			makeSpace( { sources: [ STRATECHERY_SOURCE ] } ),
		] );

		await runMutation(
			queryClient,
			deleteReadSpaceSourceMutation( queryClient ),
			{ spaceId: SPACE_ID, subscription: makeSubscription() },
			() => Promise.reject( new Error( 'nope' ) )
		);

		const spaces = queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
		expect( spaces?.[ 0 ].sources ).toEqual( [ STRATECHERY_SOURCE ] );
	} );
} );
