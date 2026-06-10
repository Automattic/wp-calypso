import { QueryClient } from '@tanstack/react-query';
import {
	addReadSpaceSourceMutation,
	deleteReadSpaceSourceMutation,
	readSpacesQuery,
} from '../read-spaces';
import type { ReadSpace, SiteSubscriptionItem } from '@automattic/api-core';

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
	it( 'adds a source from a site subscription to the matching space cache entry', async () => {
		const queryClient = new QueryClient();
		queryClient.setQueryData( readSpacesQuery().queryKey, [ makeSpace() ] );
		const mutation = addReadSpaceSourceMutation( queryClient );

		await mutation.mutationFn!( { spaceId: SPACE_ID, subscription: makeSubscription() } );
		mutation.onSuccess?.( undefined, {
			spaceId: SPACE_ID,
			subscription: makeSubscription(),
		} );

		expect( queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey ) ).toEqual( [
			expect.objectContaining( {
				id: SPACE_ID,
				sources: [
					{
						feedId: 456,
						blogId: 123,
						feedUrl: 'https://stratechery.com/feed',
						siteUrl: 'https://stratechery.com',
						name: 'Stratechery',
						siteIcon: 'https://stratechery.com/icon.png',
					},
				],
			} ),
		] );
	} );

	it( 'does not add the same subscription twice', async () => {
		const queryClient = new QueryClient();
		const subscription = makeSubscription();
		queryClient.setQueryData( readSpacesQuery().queryKey, [ makeSpace() ] );
		const mutation = addReadSpaceSourceMutation( queryClient );

		await mutation.mutationFn!( { spaceId: SPACE_ID, subscription } );
		mutation.onSuccess?.( undefined, { spaceId: SPACE_ID, subscription } );
		await mutation.mutationFn!( { spaceId: SPACE_ID, subscription } );
		mutation.onSuccess?.( undefined, { spaceId: SPACE_ID, subscription } );

		const spaces = queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
		expect( spaces?.[ 0 ].sources ).toHaveLength( 1 );
	} );

	it( 'does not clear the spaces cache when adding before the list is cached', async () => {
		const queryClient = new QueryClient();
		const subscription = makeSubscription();
		const mutation = addReadSpaceSourceMutation( queryClient );

		await mutation.mutationFn!( { spaceId: SPACE_ID, subscription } );
		mutation.onSuccess?.( undefined, { spaceId: SPACE_ID, subscription } );

		expect( queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey ) ).toEqual( [] );
	} );

	it( 'deletes a subscription from the matching space cache entry', async () => {
		const queryClient = new QueryClient();
		const subscription = makeSubscription();
		queryClient.setQueryData( readSpacesQuery().queryKey, [
			makeSpace( {
				sources: [
					{
						feedId: 456,
						blogId: 123,
						feedUrl: 'https://stratechery.com/feed',
						siteUrl: 'https://stratechery.com',
						name: 'Stratechery',
						siteIcon: 'https://stratechery.com/icon.png',
					},
				],
			} ),
		] );
		const mutation = deleteReadSpaceSourceMutation( queryClient );

		await mutation.mutationFn!( { spaceId: SPACE_ID, subscription } );
		mutation.onSuccess?.( undefined, { spaceId: SPACE_ID, subscription } );

		const spaces = queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey );
		expect( spaces?.[ 0 ].sources ).toEqual( [] );
	} );

	it( 'does not clear the spaces cache when deleting before the list is cached', async () => {
		const queryClient = new QueryClient();
		const subscription = makeSubscription();
		const mutation = deleteReadSpaceSourceMutation( queryClient );

		await mutation.mutationFn!( { spaceId: SPACE_ID, subscription } );
		mutation.onSuccess?.( undefined, { spaceId: SPACE_ID, subscription } );

		expect( queryClient.getQueryData< ReadSpace[] >( readSpacesQuery().queryKey ) ).toEqual( [] );
	} );
} );
