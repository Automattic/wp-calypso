import { readerMastodonKeys } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	useCreateMastodonConnectionMutation,
	useMastodonConnectionQuery,
	useMastodonConnectionsQuery,
} from '../reader-mastodon';

const BASE = 'https://public-api.wordpress.com';
function makeWrapper( c: QueryClient ) {
	function Wrapper( { children }: { children: React.ReactNode } ) {
		return <QueryClientProvider client={ c }>{ children }</QueryClientProvider>;
	}
	return Wrapper;
}

describe( 'reader-mastodon hooks', () => {
	afterEach( () => nock.cleanAll() );

	it( 'useMastodonConnectionsQuery returns the list', async () => {
		nock( BASE ).get( '/wpcom/v2/reader/mastodon/connections' ).reply( 200, { connections: [] } );
		const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const { result } = renderHook( () => useMastodonConnectionsQuery(), {
			wrapper: makeWrapper( client ),
		} );
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
	} );

	it( 'useCreateMastodonConnectionMutation invalidates the connections query', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections' )
			.reply( 200, {
				connection: {
					id: 101,
					handle: 'alice',
					instance: 'mastodon.social',
					avatar: null,
				},
			} );
		const client = new QueryClient();
		client.setQueryData( readerMastodonKeys.connections(), 'old' );
		const spy = jest.spyOn( client, 'invalidateQueries' );
		const { result } = renderHook( () => useCreateMastodonConnectionMutation(), {
			wrapper: makeWrapper( client ),
		} );
		await result.current.mutateAsync( {
			instance: 'mastodon.social',
			handle: 'alice',
			access_token: 'xxxx',
		} );
		await waitFor( () => expect( spy ).toHaveBeenCalled() );
	} );

	it( 'useMastodonConnectionQuery is disabled when id is null', () => {
		const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const { result } = renderHook( () => useMastodonConnectionQuery( null ), {
			wrapper: makeWrapper( client ),
		} );
		expect( result.current.fetchStatus ).toBe( 'idle' );
	} );

	it( 'useMastodonConnectionQuery fetches /connections/:id', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/42' )
			.reply( 200, {
				handle: 'alice',
				instance: 'mastodon.social',
				display_name: 'Alice',
				description: '',
				avatar: 'https://cdn/avatar.png',
				header: null,
				counts: { followers: 0, following: 0, toots: 0 },
				raw: {},
			} );
		const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const { result } = renderHook( () => useMastodonConnectionQuery( 42 ), {
			wrapper: makeWrapper( client ),
		} );
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data?.avatar ).toBe( 'https://cdn/avatar.png' );
	} );
} );
