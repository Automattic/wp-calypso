/**
 * @jest-environment jsdom
 */
import { readSavedKeysQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { canSavePost, savedKeyForPost, savedKeysForPost, useIsPostSaved, useSavePost } from '..';
import type { ReadSavedKeysResponse } from '@automattic/api-core';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';

const WPCOM_POST = { ID: 1, site_ID: 100, feed_ID: 50, feed_item_ID: 9001, is_external: false };
// `/read/saved` returns an RSS post with its feed ID as `site_ID`.
const RSS_POST = { ID: 9000, site_ID: 60, feed_ID: 60, feed_item_ID: 9000, is_external: true };
// A Jetpack post shown with its WordPress.com copy, after being saved while that
// copy failed to load.
const JETPACK_POST = { ID: 45, site_ID: 123, feed_ID: 70, feed_item_ID: 6000, is_external: false };
// The same Jetpack post saved under both of its keys.
const JETPACK_SAVED_KEYS = [
	{ blog_id: 123, post_id: 45, date_saved: '2026-10-02T00:00:00+00:00' },
	{ feed_item_id: 6000, date_saved: '2026-10-01T00:00:00+00:00' },
];

function makeClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

function makeWrapper( client: QueryClient ) {
	return function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};
}

function setKeys( client: QueryClient, keys: ReadSavedKeysResponse[ 'keys' ] ) {
	client.setQueryData< ReadSavedKeysResponse >( readSavedKeysQuery().queryKey, {
		keys,
		total: keys.length,
	} );
}

afterEach( () => nock.cleanAll() );

describe( 'savedKeyForPost', () => {
	it( 'keys a WordPress.com post by blog and post ID, even when it has a feed item', () => {
		expect( savedKeyForPost( WPCOM_POST ) ).toEqual( { blog_id: 100, post_id: 1 } );
	} );

	it( 'keys an RSS post by its feed item ID', () => {
		expect( savedKeyForPost( RSS_POST ) ).toEqual( { feed_item_id: 9000 } );
	} );

	it( 'falls back to the ID of an RSS post without a feed item ID', () => {
		expect( savedKeyForPost( { ID: 9000, is_external: true } ) ).toEqual( { feed_item_id: 9000 } );
	} );

	it( 'returns null for a post without the IDs the API needs', () => {
		expect( savedKeyForPost( { ID: 1 } ) ).toBeNull();
		expect( savedKeyForPost( { site_ID: 100 } ) ).toBeNull();
		expect( savedKeyForPost( { is_external: true } ) ).toBeNull();
	} );
} );

describe( 'savedKeysForPost', () => {
	it( 'adds the feed item key to a post that is not external', () => {
		expect( savedKeysForPost( WPCOM_POST ) ).toEqual( [
			{ blog_id: 100, post_id: 1 },
			{ feed_item_id: 9001 },
		] );
	} );

	it( 'returns only the feed item key for an RSS post', () => {
		expect( savedKeysForPost( RSS_POST ) ).toEqual( [ { feed_item_id: 9000 } ] );
	} );

	it( 'returns only the blog and post key for a post without a feed item', () => {
		expect( savedKeysForPost( { ID: 1, site_ID: 100 } ) ).toEqual( [
			{ blog_id: 100, post_id: 1 },
		] );
	} );

	it( 'returns no keys for a post without the IDs the API needs', () => {
		expect( savedKeysForPost( { ID: 1, feed_item_ID: 9001 } ) ).toEqual( [] );
	} );
} );

describe( 'canSavePost', () => {
	it( 'allows WordPress.com and RSS posts', () => {
		expect( canSavePost( WPCOM_POST ) ).toBe( true );
		expect( canSavePost( RSS_POST ) ).toBe( true );
	} );

	it( 'does not allow a post without the IDs the API needs', () => {
		expect( canSavePost( { ID: 1 } ) ).toBe( false );
		expect( canSavePost( { is_external: true } ) ).toBe( false );
	} );
} );

describe( 'useIsPostSaved', () => {
	it( 'fetches the keys and reports which posts are saved', async () => {
		const request = nock( BASE )
			.get( '/wpcom/v2/read/saved/keys' )
			.reply( 200, {
				keys: [
					{ blog_id: 100, post_id: 1, date_saved: '2026-10-01T00:00:00+00:00' },
					{ feed_item_id: 9000, date_saved: '2026-09-01T00:00:00+00:00' },
				],
				total: 2,
			} );
		const client = makeClient();

		const { result } = renderHook(
			() => ( {
				wpcom: useIsPostSaved( WPCOM_POST ),
				rss: useIsPostSaved( RSS_POST ),
				other: useIsPostSaved( { ID: 2, site_ID: 100 } ),
			} ),
			{ wrapper: makeWrapper( client ) }
		);

		expect( result.current.wpcom ).toBeUndefined();
		await waitFor( () => expect( result.current.wpcom ).toBe( true ) );
		expect( request.isDone() ).toBe( true );
		expect( result.current.rss ).toBe( true );
		expect( result.current.other ).toBe( false );
	} );

	it( 'reports a post saved under its feed item before it had a blog and post ID', () => {
		const client = makeClient();
		setKeys( client, [ { feed_item_id: 6000, date_saved: '2026-10-01T00:00:00+00:00' } ] );

		const { result } = renderHook( () => useIsPostSaved( JETPACK_POST, { enabled: false } ), {
			wrapper: makeWrapper( client ),
		} );

		expect( result.current ).toBe( true );
	} );

	it( 'does not fetch when disabled or when the post has no key', () => {
		const client = makeClient();

		const { result } = renderHook(
			() => ( {
				disabled: useIsPostSaved( WPCOM_POST, { enabled: false } ),
				noKey: useIsPostSaved( { ID: 1 } ),
				noPost: useIsPostSaved( null ),
			} ),
			{ wrapper: makeWrapper( client ) }
		);

		expect( result.current ).toEqual( { disabled: undefined, noKey: false, noPost: false } );
		expect( client.getQueryState( readSavedKeysQuery().queryKey )?.fetchStatus ).toBe( 'idle' );
	} );

	it( 'does not re-render for a post whose saved state did not change', async () => {
		const client = makeClient();
		setKeys( client, [] );
		let otherPostRenders = 0;
		renderHook(
			() => {
				otherPostRenders++;
				return useIsPostSaved( { ID: 2, site_ID: 100 }, { enabled: false } );
			},
			{ wrapper: makeWrapper( client ) }
		);
		const { result } = renderHook( () => useIsPostSaved( WPCOM_POST, { enabled: false } ), {
			wrapper: makeWrapper( client ),
		} );
		const rendersBefore = otherPostRenders;

		act( () =>
			setKeys( client, [ { blog_id: 100, post_id: 1, date_saved: '2026-10-01T00:00:00+00:00' } ] )
		);

		await waitFor( () => expect( result.current ).toBe( true ) );
		expect( otherPostRenders ).toBe( rendersBefore );
	} );
} );

describe( 'useSavePost', () => {
	function renderSavePost( client: QueryClient, post = WPCOM_POST ) {
		return renderHook(
			() => ( {
				isSaved: useIsPostSaved( post, { enabled: false } ),
				...useSavePost(),
			} ),
			{ wrapper: makeWrapper( client ) }
		).result;
	}

	it( 'saves the post by its blog and post ID with the reader-web source', async () => {
		const client = makeClient();
		setKeys( client, [] );
		const request = nock( BASE )
			.post( '/wpcom/v2/read/saved/new', { blog_id: 100, post_id: 1, source: 'reader-web' } )
			.reply( 200, { saved: true, key: { blog_id: 100, post_id: 1 }, total: 1 } );
		const result = renderSavePost( client );

		act( () => result.current.savePost( WPCOM_POST ) );

		await waitFor( () => expect( request.isDone() ).toBe( true ) );
		expect( result.current.isSaved ).toBe( true );
	} );

	it( 'unsaves the post', async () => {
		const client = makeClient();
		setKeys( client, [ { feed_item_id: 9000, date_saved: '2026-09-01T00:00:00+00:00' } ] );
		const request = nock( BASE )
			.post( '/wpcom/v2/read/saved/delete', { feed_item_id: 9000, source: 'reader-web' } )
			.reply( 200, { saved: false, key: { feed_item_id: 9000 }, total: 0 } );
		const result = renderSavePost( client, RSS_POST );
		expect( result.current.isSaved ).toBe( true );

		act( () => result.current.unsavePost( RSS_POST ) );

		await waitFor( () => expect( request.isDone() ).toBe( true ) );
		expect( result.current.isSaved ).toBe( false );
	} );

	it( 'unsaves the post by the key it was saved under', async () => {
		const client = makeClient();
		setKeys( client, [ { feed_item_id: 6000, date_saved: '2026-10-01T00:00:00+00:00' } ] );
		const request = nock( BASE )
			.post( '/wpcom/v2/read/saved/delete', { feed_item_id: 6000, source: 'reader-web' } )
			.reply( 200, { saved: false, key: { feed_item_id: 6000 }, total: 0 } );
		const result = renderSavePost( client, JETPACK_POST );

		act( () => result.current.unsavePost( JETPACK_POST ) );

		await waitFor( () => expect( request.isDone() ).toBe( true ) );
		expect( result.current.isSaved ).toBe( false );
	} );

	it( 'unsaves a post saved under both of its keys', async () => {
		const client = makeClient();
		setKeys( client, JETPACK_SAVED_KEYS );
		const requests = nock( BASE )
			.post( '/wpcom/v2/read/saved/delete', { blog_id: 123, post_id: 45, source: 'reader-web' } )
			.reply( 200, { saved: false, key: { blog_id: 123, post_id: 45 }, total: 1 } )
			.post( '/wpcom/v2/read/saved/delete', { feed_item_id: 6000, source: 'reader-web' } )
			.reply( 200, { saved: false, key: { feed_item_id: 6000 }, total: 0 } );
		const onSuccess = jest.fn();
		const result = renderSavePost( client, JETPACK_POST );

		act( () => result.current.unsavePost( JETPACK_POST, { onSuccess } ) );

		await waitFor( () => expect( onSuccess ).toHaveBeenCalledTimes( 1 ) );
		expect( requests.isDone() ).toBe( true );
		expect( result.current.isSaved ).toBe( false );
	} );

	it.each( [
		{ failing: 'blog and post', blogPostStatus: 500, feedItemStatus: 200 },
		{ failing: 'feed item', blogPostStatus: 200, feedItemStatus: 500 },
	] )(
		'calls onError once when the $failing key fails to unsave',
		async ( { blogPostStatus, feedItemStatus } ) => {
			const client = makeClient();
			setKeys( client, JETPACK_SAVED_KEYS );
			const requests = nock( BASE )
				.post( '/wpcom/v2/read/saved/delete', { blog_id: 123, post_id: 45, source: 'reader-web' } )
				.reply( blogPostStatus )
				.post( '/wpcom/v2/read/saved/delete', { feed_item_id: 6000, source: 'reader-web' } )
				.reply( feedItemStatus );
			const onError = jest.fn();
			const result = renderSavePost( client, JETPACK_POST );

			act( () => result.current.unsavePost( JETPACK_POST, { onError } ) );

			await waitFor( () => expect( onError ).toHaveBeenCalledTimes( 1 ) );
			expect( requests.isDone() ).toBe( true );
			expect( result.current.isSaved ).toBe( true );
		}
	);

	it( 'shows the post as unsaved and calls onError when the save fails', async () => {
		const client = makeClient();
		setKeys( client, [] );
		nock( BASE )
			.post( '/wpcom/v2/read/saved/new' )
			.reply( 403, { error: 'saved_limit_reached', message: 'Limit reached.' } );
		const onError = jest.fn();
		const result = renderSavePost( client );

		act( () => result.current.savePost( WPCOM_POST, { onError } ) );

		await waitFor( () => expect( onError ).toHaveBeenCalledTimes( 1 ) );
		expect( result.current.isSaved ).toBe( false );
	} );

	it( 'ignores a post without the IDs the API needs', () => {
		const client = makeClient();
		const result = renderSavePost( client );

		act( () => result.current.savePost( { ID: 1 } ) );

		expect( client.getMutationCache().getAll() ).toHaveLength( 0 );
	} );
} );
