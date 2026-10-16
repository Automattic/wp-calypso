import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	getReadSavedKeyId,
	readSavedKeysQuery,
	saveReadPostMutation,
	unsaveReadPostMutation,
} from '../read-saved';
import { getStreamInfiniteQueryKey } from '../read-streams';
import type {
	ReadSavedKey,
	ReadSavedKeyEntry,
	ReadSavedKeysResponse,
	ReadSavedPostResponse,
} from '@automattic/api-core';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';
const SOURCE = 'reader-web';

const POST_KEY = { blog_id: 100, post_id: 1 };
const FEED_ITEM_KEY = { feed_item_id: 9000 };

const makeWrapper = ( client: QueryClient ) =>
	function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};

const newClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

const entry = ( key: object, date_saved = '2026-10-01T00:00:00+00:00' ) =>
	( { ...key, date_saved } ) as ReadSavedKeyEntry;

const setKeys = ( client: QueryClient, keys: ReadSavedKeyEntry[] ) =>
	client.setQueryData< ReadSavedKeysResponse >( readSavedKeysQuery().queryKey, {
		keys,
		total: keys.length,
	} );

const getKeys = ( client: QueryClient ) =>
	client.getQueryData< ReadSavedKeysResponse >( readSavedKeysQuery().queryKey );

const getKeyIds = ( client: QueryClient ) => getKeys( client )?.keys.map( getReadSavedKeyId );

const savedStreamQueryKey = getStreamInfiniteQueryKey( {
	streamKey: 'saved',
	feedId: null,
	localeSlug: null,
	startDate: null,
} );

const seedSavedStream = ( client: QueryClient ) =>
	client.setQueryData( savedStreamQueryKey, { pages: [], pageParams: [] } );

const renderMutation = (
	client: QueryClient,
	factory: typeof saveReadPostMutation | typeof unsaveReadPostMutation
) =>
	renderHook( () => useMutation( factory( client ) ), { wrapper: makeWrapper( client ) } ).result;

afterEach( () => nock.cleanAll() );

describe( 'getReadSavedKeyId', () => {
	it( 'tells post keys and feed item keys apart', () => {
		expect( getReadSavedKeyId( POST_KEY ) ).toBe( 'blog-100-post-1' );
		expect( getReadSavedKeyId( FEED_ITEM_KEY ) ).toBe( 'feed-item-9000' );
		expect( getReadSavedKeyId( { blog_id: 1, post_id: 100 } ) ).not.toBe(
			getReadSavedKeyId( { blog_id: 100, post_id: 1 } )
		);
	} );

	it( 'ignores date_saved', () => {
		expect( getReadSavedKeyId( entry( POST_KEY ) ) ).toBe( getReadSavedKeyId( POST_KEY ) );
	} );
} );

describe( 'readSavedKeysQuery', () => {
	it( 'fetches the keys from /wpcom/v2/read/saved/keys', async () => {
		const keys = [ entry( POST_KEY ), entry( FEED_ITEM_KEY ) ];
		const request = nock( BASE )
			.get( '/wpcom/v2/read/saved/keys' )
			.reply( 200, { keys, total: 2 } );
		const client = newClient();

		const { result } = renderHook( () => useQuery( readSavedKeysQuery() ), {
			wrapper: makeWrapper( client ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( request.isDone() ).toBe( true );
		expect( result.current.data ).toEqual( { keys, total: 2 } );
		expect( readSavedKeysQuery().queryKey ).toEqual( [ 'read', 'saved', 'keys' ] );
	} );
} );

describe( 'saveReadPostMutation', () => {
	it( 'adds the key before the request resolves and posts it to /read/saved/new', async () => {
		const client = newClient();
		setKeys( client, [ entry( FEED_ITEM_KEY ) ] );
		let idsDuringRequest: string[] | undefined;
		const request = nock( BASE )
			.post( '/wpcom/v2/read/saved/new', { ...POST_KEY, source: SOURCE } )
			.reply( () => {
				idsDuringRequest = getKeyIds( client );
				return [ 200, { saved: true, key: POST_KEY, total: 2 } ];
			} );
		const result = renderMutation( client, saveReadPostMutation );

		await act( () => result.current.mutateAsync( { key: POST_KEY, source: SOURCE } ) );

		expect( request.isDone() ).toBe( true );
		expect( idsDuringRequest ).toEqual( [ 'blog-100-post-1', 'feed-item-9000' ] );
		expect( getKeys( client )?.total ).toBe( 2 );
	} );

	it( 'posts a feed item key as feed_item_id', async () => {
		const client = newClient();
		const request = nock( BASE )
			.post( '/wpcom/v2/read/saved/new', { feed_item_id: 9000, source: SOURCE } )
			.reply( 200, { saved: true, key: FEED_ITEM_KEY, total: 1 } );
		const result = renderMutation( client, saveReadPostMutation );

		await act( () => result.current.mutateAsync( { key: FEED_ITEM_KEY, source: SOURCE } ) );

		expect( request.isDone() ).toBe( true );
	} );

	it( 'removes the key again when the save fails', async () => {
		const client = newClient();
		setKeys( client, [ entry( FEED_ITEM_KEY ) ] );
		nock( BASE )
			.post( '/wpcom/v2/read/saved/new' )
			.reply( 403, { code: 'saved_limit_reached', message: 'Limit reached.' } );
		const result = renderMutation( client, saveReadPostMutation );

		await act( async () => {
			await expect(
				result.current.mutateAsync( { key: POST_KEY, source: SOURCE } )
			).rejects.toBeTruthy();
		} );

		expect( getKeyIds( client ) ).toEqual( [ 'feed-item-9000' ] );
		expect( getKeys( client )?.total ).toBe( 1 );
	} );

	it( 'leaves a post that was already saved in place when the save fails', async () => {
		const client = newClient();
		setKeys( client, [ entry( POST_KEY ) ] );
		nock( BASE ).post( '/wpcom/v2/read/saved/new' ).reply( 500, { code: 'oops' } );
		const result = renderMutation( client, saveReadPostMutation );

		await act( async () => {
			await expect(
				result.current.mutateAsync( { key: POST_KEY, source: SOURCE } )
			).rejects.toBeTruthy();
		} );

		expect( getKeyIds( client ) ).toEqual( [ 'blog-100-post-1' ] );
		expect( getKeys( client )?.total ).toBe( 1 );
	} );

	it( 'still sends the request when cancelling the keys query fails', async () => {
		const client = newClient();
		jest.spyOn( client, 'cancelQueries' ).mockRejectedValueOnce( new Error( 'cancel failed' ) );
		const request = nock( BASE )
			.post( '/wpcom/v2/read/saved/new' )
			.reply( 200, { saved: true, key: POST_KEY, total: 1 } );
		const result = renderMutation( client, saveReadPostMutation );

		await act( () => result.current.mutateAsync( { key: POST_KEY, source: SOURCE } ) );

		expect( request.isDone() ).toBe( true );
	} );

	it( 'invalidates the keys query and the saved stream once it settles', async () => {
		const client = newClient();
		setKeys( client, [] );
		seedSavedStream( client );
		nock( BASE )
			.post( '/wpcom/v2/read/saved/new' )
			.reply( 200, { saved: true, key: POST_KEY, total: 1 } );
		const result = renderMutation( client, saveReadPostMutation );

		await act( () => result.current.mutateAsync( { key: POST_KEY, source: SOURCE } ) );

		expect( client.getQueryState( readSavedKeysQuery().queryKey )?.isInvalidated ).toBe( true );
		expect( client.getQueryState( savedStreamQueryKey )?.isInvalidated ).toBe( true );
	} );

	it( 'only invalidates after the last of several concurrent saves settles', async () => {
		const client = newClient();
		setKeys( client, [] );
		const otherKey = { blog_id: 200, post_id: 2 };
		const replies: Array< () => void > = [];
		nock( BASE )
			.post( '/wpcom/v2/read/saved/new' )
			.twice()
			.reply( ( _uri, _body, callback ) => {
				replies.push( () => callback( null, [ 200, { saved: true, key: POST_KEY, total: 1 } ] ) );
			} );
		const invalidateQueries = jest.spyOn( client, 'invalidateQueries' );
		const first = renderMutation( client, saveReadPostMutation );
		const second = renderMutation( client, saveReadPostMutation );

		let firstDone: Promise< unknown > = Promise.resolve();
		let secondDone: Promise< unknown > = Promise.resolve();
		act( () => {
			firstDone = first.current.mutateAsync( { key: POST_KEY, source: SOURCE } );
			secondDone = second.current.mutateAsync( { key: otherKey, source: SOURCE } );
		} );
		await waitFor( () => expect( replies ).toHaveLength( 2 ) );
		expect( getKeyIds( client ) ).toEqual( [ 'blog-200-post-2', 'blog-100-post-1' ] );

		await act( async () => {
			replies[ 0 ]();
			await firstDone;
		} );
		expect( invalidateQueries ).not.toHaveBeenCalled();

		await act( async () => {
			replies[ 1 ]();
			await secondDone;
		} );
		expect( invalidateQueries ).toHaveBeenCalledTimes( 2 );
	} );
} );

describe( 'unsaveReadPostMutation', () => {
	it( 'removes the key before the request resolves and posts it to /read/saved/delete', async () => {
		const client = newClient();
		setKeys( client, [ entry( FEED_ITEM_KEY ), entry( POST_KEY ) ] );
		let idsDuringRequest: string[] | undefined;
		const request = nock( BASE )
			.post( '/wpcom/v2/read/saved/delete', { ...POST_KEY, source: SOURCE } )
			.reply( () => {
				idsDuringRequest = getKeyIds( client );
				return [ 200, { saved: false, key: POST_KEY, total: 1 } ];
			} );
		const result = renderMutation( client, unsaveReadPostMutation );

		await act( () => result.current.mutateAsync( { key: POST_KEY, source: SOURCE } ) );

		expect( request.isDone() ).toBe( true );
		expect( idsDuringRequest ).toEqual( [ 'feed-item-9000' ] );
		expect( getKeys( client )?.total ).toBe( 1 );
	} );

	it( 'puts the key back where it was when the unsave fails', async () => {
		const client = newClient();
		const removed = entry( POST_KEY, '2026-09-01T00:00:00+00:00' );
		setKeys( client, [ entry( FEED_ITEM_KEY ), removed, entry( { blog_id: 300, post_id: 3 } ) ] );
		nock( BASE ).post( '/wpcom/v2/read/saved/delete' ).reply( 500, { code: 'oops' } );
		const result = renderMutation( client, unsaveReadPostMutation );

		await act( async () => {
			await expect(
				result.current.mutateAsync( { key: POST_KEY, source: SOURCE } )
			).rejects.toBeTruthy();
		} );

		expect( getKeys( client )?.keys ).toEqual( [
			entry( FEED_ITEM_KEY ),
			removed,
			entry( { blog_id: 300, post_id: 3 } ),
		] );
		expect( getKeys( client )?.total ).toBe( 3 );
	} );

	it( 'invalidates the keys query and the saved stream once it settles', async () => {
		const client = newClient();
		setKeys( client, [ entry( POST_KEY ) ] );
		seedSavedStream( client );
		nock( BASE )
			.post( '/wpcom/v2/read/saved/delete' )
			.reply( 200, { saved: false, key: POST_KEY, total: 0 } );
		const result = renderMutation( client, unsaveReadPostMutation );

		await act( () => result.current.mutateAsync( { key: POST_KEY, source: SOURCE } ) );

		expect( client.getQueryState( readSavedKeysQuery().queryKey )?.isInvalidated ).toBe( true );
		expect( client.getQueryState( savedStreamQueryKey )?.isInvalidated ).toBe( true );
	} );
} );

describe( 'overlapping saves and unsaves', () => {
	const OTHER_KEY = { blog_id: 200, post_id: 2 };

	// Runs a mutation through the real TanStack lifecycle, with a request the
	// test settles by hand.
	const start = (
		client: QueryClient,
		factory: typeof saveReadPostMutation | typeof unsaveReadPostMutation,
		key: ReadSavedKey
	) => {
		let resolve!: () => void;
		let reject!: () => void;
		const request = new Promise< ReadSavedPostResponse >( ( res, rej ) => {
			resolve = () => res( { saved: factory === saveReadPostMutation, key, total: 0 } );
			reject = () => rej( new Error( 'Request failed' ) );
		} );
		const done = client
			.getMutationCache()
			.build( client, { ...factory( client ), mutationFn: () => request } )
			.execute( { key, source: SOURCE } )
			.catch( () => undefined );

		return { resolve, reject, done };
	};

	// Lets each mutation's async `onMutate` finish before the next one starts.
	const flush = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

	it( 'invalidates when concurrent writes settle in the same tick', async () => {
		const client = newClient();
		setKeys( client, [] );
		seedSavedStream( client );
		const first = start( client, saveReadPostMutation, POST_KEY );
		const second = start( client, saveReadPostMutation, OTHER_KEY );
		await flush();

		first.resolve();
		second.resolve();
		await Promise.all( [ first.done, second.done ] );

		expect( client.getQueryState( readSavedKeysQuery().queryKey )?.isInvalidated ).toBe( true );
		expect( client.getQueryState( savedStreamQueryKey )?.isInvalidated ).toBe( true );
	} );

	it( 'does not let an older failed save undo a newer save of the same post', async () => {
		const client = newClient();
		setKeys( client, [] );
		const firstSave = start( client, saveReadPostMutation, POST_KEY );
		await flush();
		const unsave = start( client, unsaveReadPostMutation, POST_KEY );
		await flush();
		const secondSave = start( client, saveReadPostMutation, POST_KEY );
		await flush();

		firstSave.reject();
		await firstSave.done;

		expect( getKeyIds( client ) ).toEqual( [ 'blog-100-post-1' ] );

		unsave.resolve();
		secondSave.resolve();
		await Promise.all( [ unsave.done, secondSave.done ] );
	} );

	it( 'does not let an older failed unsave restore a post a newer unsave removed', async () => {
		const client = newClient();
		setKeys( client, [ entry( POST_KEY ) ] );
		const firstUnsave = start( client, unsaveReadPostMutation, POST_KEY );
		await flush();
		const save = start( client, saveReadPostMutation, POST_KEY );
		await flush();
		const secondUnsave = start( client, unsaveReadPostMutation, POST_KEY );
		await flush();

		firstUnsave.reject();
		await firstUnsave.done;

		expect( getKeyIds( client ) ).toEqual( [] );

		save.resolve();
		secondUnsave.resolve();
		await Promise.all( [ save.done, secondUnsave.done ] );
	} );

	it( 'rolls back the newest write to a post when it fails', async () => {
		const client = newClient();
		setKeys( client, [] );
		const save = start( client, saveReadPostMutation, POST_KEY );
		await flush();
		const unsave = start( client, unsaveReadPostMutation, POST_KEY );
		await flush();

		unsave.reject();
		await unsave.done;

		expect( getKeyIds( client ) ).toEqual( [ 'blog-100-post-1' ] );

		save.resolve();
		await save.done;
	} );
} );
