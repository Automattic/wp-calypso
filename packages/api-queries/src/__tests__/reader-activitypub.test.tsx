import { readerActivityPubKeys } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	useAuthorizeFediverseConnectionMutation,
	useCompleteFediverseConnectionMutation,
	useCreateFediverseNoteMutation,
	useDisconnectFediverseMutation,
	useEnableFediverseC2sMutation,
	useEnableFediverseFeatureMutation,
	useEnableFediverseUserActorsMutation,
	useFediverseConnectionQuery,
	useFediverseConnectionsQuery,
	useFediverseSiteCapabilitiesQuery,
} from '../reader-activitypub';

const BASE = 'https://public-api.wordpress.com';

function makeWrapper( c: QueryClient ) {
	function Wrapper( { children }: { children: React.ReactNode } ) {
		return <QueryClientProvider client={ c }>{ children }</QueryClientProvider>;
	}
	return Wrapper;
}

function createWrapper() {
	const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return makeWrapper( client );
}

const STUB_CONNECTION = {
	id: 1,
	site_host: 'example.wordpress.com',
	handle: '@alice@example.wordpress.com',
	avatar: 'https://cdn/avatar.png',
	actor_url: 'https://example.wordpress.com/wp-json/activitypub/1.0/users/1',
	blog_id: 123,
	actor_type: 'user',
};

describe( 'reader-activitypub hooks', () => {
	afterEach( () => nock.cleanAll() );

	it( 'useFediverseConnectionsQuery returns the list', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/activitypub/connections' )
			.reply( 200, { connections: [] } );
		const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const { result } = renderHook( () => useFediverseConnectionsQuery(), {
			wrapper: makeWrapper( client ),
		} );
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
	} );

	it( 'useFediverseConnectionQuery is disabled when id is null', () => {
		const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const { result } = renderHook( () => useFediverseConnectionQuery( null ), {
			wrapper: makeWrapper( client ),
		} );
		expect( result.current.fetchStatus ).toBe( 'idle' );
	} );

	it( 'useFediverseConnectionQuery fetches /connections/:id', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/activitypub/connections/42' )
			.reply( 200, { ...STUB_CONNECTION, id: 42 } );
		const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const { result } = renderHook( () => useFediverseConnectionQuery( 42 ), {
			wrapper: makeWrapper( client ),
		} );
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data?.id ).toBe( 42 );
	} );

	it( 'useFediverseSiteCapabilitiesQuery fetches /sites/:blog_id/capabilities', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/activitypub/sites/123/capabilities' )
			.reply( 200, {
				activitypub_active: true,
				c2s_enabled: true,
				actors: {
					user: { enabled: true, can_enable: true },
					blog: { enabled: false, can_enable: true },
				},
				oauth_metadata: null,
				site_host: 'example.wordpress.com',
				site_kind: 'wpcom',
				current_user_can_publish: true,
			} );
		const { result } = renderHook( () => useFediverseSiteCapabilitiesQuery( 123 ), {
			wrapper: createWrapper(),
		} );
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data?.c2s_enabled ).toBe( true );
	} );

	it( 'useAuthorizeFediverseConnectionMutation returns authorize_url + state without cache invalidation', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/activitypub/connections', {
				step: 'authorize',
				blog_id: 123,
			} )
			.reply( 200, {
				authorize_url: 'https://example.wordpress.com/oauth/authorize?state=abc',
				state: 'abc',
			} );
		const client = new QueryClient();
		const spy = jest.spyOn( client, 'invalidateQueries' );
		const { result } = renderHook( () => useAuthorizeFediverseConnectionMutation(), {
			wrapper: makeWrapper( client ),
		} );
		const response = await result.current.mutateAsync( { blog_id: 123 } );
		expect( response.state ).toBe( 'abc' );
		// authorize is a pure redirect-fetcher — there's nothing to invalidate yet.
		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'useCompleteFediverseConnectionMutation seeds the connections list cache synchronously', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/activitypub/connections', {
				step: 'complete',
				code: 'xyz',
				state: 'abc',
			} )
			.reply( 200, { connection: { ...STUB_CONNECTION, id: 202 } } );
		const client = new QueryClient();
		client.setQueryData( readerActivityPubKeys.connections(), {
			connections: [ { ...STUB_CONNECTION, id: 1 } ],
		} );
		const { result } = renderHook( () => useCompleteFediverseConnectionMutation(), {
			wrapper: makeWrapper( client ),
		} );
		await result.current.mutateAsync( { code: 'xyz', state: 'abc' } );

		const cached = client.getQueryData< { connections: Array< { id: number } > } >(
			readerActivityPubKeys.connections()
		);
		expect( cached?.connections.map( ( c ) => c.id ) ).toEqual( [ 1, 202 ] );
	} );

	it( 'useCompleteFediverseConnectionMutation does not duplicate an already-cached connection', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/activitypub/connections', {
				step: 'complete',
				code: 'xyz',
				state: 'abc',
			} )
			.reply( 200, { connection: { ...STUB_CONNECTION, id: 303 } } );
		const client = new QueryClient();
		client.setQueryData( readerActivityPubKeys.connections(), {
			connections: [ { ...STUB_CONNECTION, id: 303 } ],
		} );
		const { result } = renderHook( () => useCompleteFediverseConnectionMutation(), {
			wrapper: makeWrapper( client ),
		} );
		await result.current.mutateAsync( { code: 'xyz', state: 'abc' } );

		const cached = client.getQueryData< { connections: Array< { id: number } > } >(
			readerActivityPubKeys.connections()
		);
		expect( cached?.connections.map( ( c ) => c.id ) ).toEqual( [ 303 ] );
	} );

	it( 'useCompleteFediverseConnectionMutation invalidates the connections query', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/activitypub/connections', {
				step: 'complete',
				code: 'xyz',
				state: 'abc',
			} )
			.reply( 200, { connection: { ...STUB_CONNECTION, id: 101 } } );
		const client = new QueryClient();
		client.setQueryData( readerActivityPubKeys.connections(), 'old' );
		const spy = jest.spyOn( client, 'invalidateQueries' );
		const { result } = renderHook( () => useCompleteFediverseConnectionMutation(), {
			wrapper: makeWrapper( client ),
		} );
		await result.current.mutateAsync( { code: 'xyz', state: 'abc' } );
		await waitFor( () =>
			expect( spy ).toHaveBeenCalledWith( {
				queryKey: readerActivityPubKeys.connections(),
			} )
		);
	} );

	it( 'useEnableFediverseFeatureMutation invalidates capabilities on success', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/activitypub/sites/123/enable-feature' )
			.reply( 200, { success: true } );
		const client = new QueryClient();
		const spy = jest.spyOn( client, 'invalidateQueries' );
		const { result } = renderHook( () => useEnableFediverseFeatureMutation( 123 ), {
			wrapper: makeWrapper( client ),
		} );
		await result.current.mutateAsync();
		await waitFor( () =>
			expect( spy ).toHaveBeenCalledWith( {
				queryKey: readerActivityPubKeys.capabilities( 123 ),
			} )
		);
	} );

	it( 'useEnableFediverseC2sMutation invalidates capabilities on success', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/activitypub/sites/123/enable-c2s' )
			.reply( 200, { success: true } );
		const client = new QueryClient();
		const spy = jest.spyOn( client, 'invalidateQueries' );
		const { result } = renderHook( () => useEnableFediverseC2sMutation( 123 ), {
			wrapper: makeWrapper( client ),
		} );
		await result.current.mutateAsync();
		await waitFor( () =>
			expect( spy ).toHaveBeenCalledWith( {
				queryKey: readerActivityPubKeys.capabilities( 123 ),
			} )
		);
	} );

	it( 'useEnableFediverseUserActorsMutation invalidates capabilities on success', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/activitypub/sites/123/enable-user-actors' )
			.reply( 200, { success: true } );
		const client = new QueryClient();
		const spy = jest.spyOn( client, 'invalidateQueries' );
		const { result } = renderHook( () => useEnableFediverseUserActorsMutation( 123 ), {
			wrapper: makeWrapper( client ),
		} );
		await result.current.mutateAsync();
		await waitFor( () =>
			expect( spy ).toHaveBeenCalledWith( {
				queryKey: readerActivityPubKeys.capabilities( 123 ),
			} )
		);
	} );

	it( 'useCreateFediverseNoteMutation POSTs the note and returns it', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/activitypub/connections/7/notes', { text: 'Hello world' } )
			.reply( 200, {
				id: 'https://example.wordpress.com/activitypub/notes/1',
				url: 'https://example.wordpress.com/?p=1',
				posted_at: '2024-01-01T00:00:00Z',
			} );
		const { result } = renderHook( () => useCreateFediverseNoteMutation( 7 ), {
			wrapper: createWrapper(),
		} );
		const res = await result.current.mutateAsync( { connectionId: 7, text: 'Hello world' } );
		expect( res.id ).toBe( 'https://example.wordpress.com/activitypub/notes/1' );
	} );

	it( 'useDisconnectFediverseMutation invalidates connections and removes the per-connection query', async () => {
		nock( BASE ).delete( '/wpcom/v2/reader/activitypub/connections/7' ).reply( 200, {} );
		const client = new QueryClient();
		client.setQueryData( readerActivityPubKeys.connection( 7 ), STUB_CONNECTION );
		const invalidateSpy = jest.spyOn( client, 'invalidateQueries' );
		const removeSpy = jest.spyOn( client, 'removeQueries' );
		const { result } = renderHook( () => useDisconnectFediverseMutation( 7 ), {
			wrapper: makeWrapper( client ),
		} );
		await result.current.mutateAsync();
		await waitFor( () =>
			expect( invalidateSpy ).toHaveBeenCalledWith( {
				queryKey: readerActivityPubKeys.connections(),
			} )
		);
		expect( removeSpy ).toHaveBeenCalledWith( {
			queryKey: readerActivityPubKeys.connection( 7 ),
		} );
	} );
} );
