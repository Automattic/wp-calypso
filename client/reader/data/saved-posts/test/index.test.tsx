/**
 * @jest-environment jsdom
 */
import { readSavedKeysQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { savedKeyForPost, useIsPostSaved, useSavePost } from '..';
import type { ReadSavedKeysResponse } from '@automattic/api-core';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';

const WPCOM_POST = { ID: 1, site_ID: 100, feed_ID: 50, feed_item_ID: 9001, is_external: false };
const RSS_POST = { ID: 9000, site_ID: 0, feed_ID: 60, feed_item_ID: 9000, is_external: true };

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

beforeEach( () => nock.disableNetConnect() );

afterEach( () => {
	nock.cleanAll();
	nock.enableNetConnect();
} );

describe( 'savedKeyForPost', () => {
	it( 'keys a WordPress.com post by blog and post ID', () => {
		expect( savedKeyForPost( { ID: 1, site_ID: 100 } ) ).toEqual( { blog_id: 100, post_id: 1 } );
	} );

	it( 'keys a WordPress.com post read through Following by blog and post ID, not its feed item', () => {
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

		await waitFor( () => expect( result.current.wpcom ).toBe( true ) );
		expect( request.isDone() ).toBe( true );
		expect( result.current.rss ).toBe( true );
		expect( result.current.other ).toBe( false );
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

		expect( result.current ).toEqual( { disabled: false, noKey: false, noPost: false } );
		expect( client.getQueryState( readSavedKeysQuery().queryKey )?.fetchStatus ).toBe( 'idle' );
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

	it( 'saves the post with the reader-web source and shows it as saved right away', async () => {
		const client = makeClient();
		setKeys( client, [] );
		let respond: () => void = () => {};
		const request = nock( BASE )
			.post( '/wpcom/v2/read/saved/new', { blog_id: 100, post_id: 1, source: 'reader-web' } )
			.reply( ( _uri, _body, callback ) => {
				respond = () =>
					callback( null, [ 200, { saved: true, key: { blog_id: 100, post_id: 1 }, total: 1 } ] );
			} );
		const result = renderSavePost( client );

		act( () => result.current.savePost( WPCOM_POST ) );

		await waitFor( () => expect( result.current.isSaved ).toBe( true ) );
		expect( result.current.isPending ).toBe( true );

		act( () => respond() );

		await waitFor( () => expect( result.current.isPending ).toBe( false ) );
		expect( request.isDone() ).toBe( true );
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
